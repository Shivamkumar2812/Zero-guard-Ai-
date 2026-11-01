
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from semgrep_scanner import scan_code as run_semgrep_scan
from fastapi import UploadFile, File
from fix_suggestions import generate_suggestions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ZeroGuard AI",
    description="AI-assisted code security analysis API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Locate the trained model without depending on the terminal directory
MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "ml"
    / "models"
    / "primevul_baseline.joblib"
)

THRESHOLD = 0.70
model = None


@app.on_event("startup")
def load_ml_model():
    global model

    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Trained ML model not found at: {MODEL_PATH}"
        )

    model = joblib.load(MODEL_PATH)


class ScanRequest(BaseModel):
    code: str = Field(min_length=1)

class RetestRequest(BaseModel):
    original_code: str = Field(min_length=1)
    patched_code: str = Field(min_length=1)



@app.get("/")
def home():
    return {
        "message": "ZeroGuard AI Backend is running!",
        "status": "online"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ml_model_loaded": model is not None
    }


@app.post("/api/scan")
def scan_code(request: ScanRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded"
        )

    try:
        probabilities = model.predict_proba([request.code])[0]

        classes = list(model.classes_)
        vulnerable_index = classes.index(1)
        risk_score = float(probabilities[vulnerable_index])

        return {
            "message": "ML analysis completed",
            "language": "C/C++",
            "risk_score": round(risk_score * 100, 2),
            "model_flagged": risk_score >= THRESHOLD,
            "threshold": THRESHOLD,
            "status": "experimental_prediction",
            "warning": (
                "This is an experimental model prediction, "
                "not proof of a vulnerability. The model was "
                "trained on C/C++ functions."
            )
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"ML prediction failed: {exc}"
        )
@app.post("/api/semgrep-scan")
def semgrep_scan_endpoint(request: ScanRequest):
    try:
        return run_semgrep_scan(request.code)

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Semgrep scan failed: {exc}"
        )

@app.post("/api/analyze")
def analyze_code(request: ScanRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded"
        )

    # Step 1: Run ML analysis
    try:
        probabilities = model.predict_proba([request.code])[0]
        classes = list(model.classes_)
        vulnerable_index = classes.index(1)
        risk_score = float(probabilities[vulnerable_index])

        ml_result = {
            "status": "completed",
            "language": "C/C++",
            "risk_score": round(risk_score * 100, 2),
            "model_flagged": risk_score >= THRESHOLD,
            "threshold": THRESHOLD,
            "warning": (
                "Experimental prediction only; "
                "not proof of a vulnerability."
            )
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"ML analysis failed: {exc}"
        )

    # Step 2: Run Semgrep analysis
    try:
        semgrep_result = run_semgrep_scan(request.code)

    except Exception as exc:
        semgrep_result = {
            "scanner": "Semgrep",
            "status": "failed",
            "error": str(exc),
            "finding_count": 0,
            "findings": []
        }

    # Step 3: Return both results
    return {
        "project": "ZeroGuard AI",
        "status": "completed",
        "ml_analysis": ml_result,
        "static_analysis": semgrep_result,
        "summary": {
            "ml_risk_score": ml_result["risk_score"],
            "semgrep_findings": semgrep_result.get(
                "finding_count", 0
            ),
            "semgrep_status": semgrep_result["status"]
        }
    }

MAX_FILE_SIZE = 1_000_000  # 1 MB
ALLOWED_EXTENSIONS = {".c", ".h", ".cc", ".cpp", ".cxx", ".hpp"}


@app.post("/api/analyze-file")

async def analyze_file(file: UploadFile = File(...)):
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a C/C++ source file."
        )

    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        await file.close()
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 1 MB."
        )

    try:
        code = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File must contain valid UTF-8 text."
        )
    finally:
        await file.close()

    if not code.strip():
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded."
        )

    try:
        probabilities = model.predict_proba([code])[0]
        classes = list(model.classes_)
        vulnerable_index = classes.index(1)
        risk_score = float(probabilities[vulnerable_index])

        ml_result = {
            "status": "completed",
            "language": "C/C++",
            "risk_score": round(risk_score * 100, 2),
            "model_flagged": risk_score >= THRESHOLD,
            "threshold": THRESHOLD,
            "warning": (
                "Experimental whole-file prediction only; "
                "not proof of a vulnerability. The model was "
                "trained on C/C++ functions."
            )
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"ML analysis failed: {exc}"
        )

    try:
        semgrep_result = run_semgrep_scan(code)
    except Exception as exc:
        semgrep_result = {
            "scanner": "Semgrep",
            "status": "failed",
            "error": str(exc),
            "finding_count": 0,
            "findings": []
        }

    # Generate suggestions whether Semgrep succeeds or fails.
    fix_suggestions = generate_suggestions(
        semgrep_result.get("findings", [])
    )

    return {
        "project": "ZeroGuard AI",
        "filename": Path(filename).name,
        "status": "completed",
        "ml_analysis": ml_result,
        "static_analysis": semgrep_result,
        "fix_suggestions": fix_suggestions,
        "summary": {
            "ml_risk_score": ml_result["risk_score"],
            "semgrep_findings": semgrep_result.get("finding_count", 0),
            "semgrep_status": semgrep_result["status"]
        }
    }

@app.post("/api/retest")
def retest_code(request: RetestRequest):
    from collections import Counter

    try:
        original_result = run_semgrep_scan(request.original_code)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Original code scan failed: {exc}"
        )

    try:
        patched_result = run_semgrep_scan(request.patched_code)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Patched code scan failed: {exc}"
        )

    if (
        original_result.get("status") != "completed"
        or patched_result.get("status") != "completed"
    ):
        raise HTTPException(
            status_code=502,
            detail="Both scans must complete to compare results."
        )

    original_findings = original_result.get("findings", [])
    patched_findings = patched_result.get("findings", [])

    def finding_keys(findings):
        return Counter(
            (f.get("rule_id"), f.get("message"))
            for f in findings
        )

    before = finding_keys(original_findings)
    after = finding_keys(patched_findings)

    resolved = sum((before - after).values())
    introduced = sum((after - before).values())
    remaining = len(patched_findings)

    return {
        "project": "ZeroGuard AI",
        "status": "completed",
        "retest_passed": remaining == 0,
        "before": {
            "finding_count": len(original_findings),
            "findings": original_findings
        },
        "after": {
            "finding_count": remaining,
            "findings": patched_findings
        },
        "comparison": {
            "resolved_findings": resolved,
            "remaining_findings": remaining,
            "new_findings": introduced,
            "message": (
                "No Semgrep findings remain. Review other tests "
                "before declaring the fix safe."
                if remaining == 0
                else "Potential findings remain. Review and retest."
            )
        }
    }


