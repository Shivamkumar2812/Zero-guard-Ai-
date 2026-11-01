import json
import subprocess
import tempfile
from pathlib import Path

SEMGREP_EXE = (
    Path(__file__).resolve().parent
    / ".semgrep-venv"
    / "Scripts"
    / "pysemgrep.exe"
)


def scan_code(code: str) -> dict:
    if not SEMGREP_EXE.exists():
        raise RuntimeError("Semgrep executable was not found.")

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".c",
            prefix="zeroguard_scan_",
            dir=Path(__file__).resolve().parent,
            encoding="utf-8",
            delete=False,
        ) as temp_file:
            temp_file.write(code)
            temp_path = Path(temp_file.name)

        result = subprocess.run(
            [
                str(SEMGREP_EXE),
                "scan",
                "--config",
                "p/security-audit",
                "--json",
                "--quiet",
                str(temp_path),
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )

        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError:
            raise RuntimeError(
                "Semgrep returned invalid JSON: "
                + result.stderr[-1500:]
            )

        findings = []

        for item in data.get("results", []):
            extra = item.get("extra", {})
            metadata = extra.get("metadata", {})

            findings.append({
                "rule_id": item.get("check_id"),
                "message": extra.get("message", ""),
                "severity": extra.get("severity", "INFO"),
                "line": item.get("start", {}).get("line"),
                "end_line": item.get("end", {}).get("line"),
                "cwe": metadata.get("cwe", []),
                "confidence": metadata.get("confidence", "UNKNOWN"),
                "rule_url": metadata.get("source"),
            })

        return {
            "scanner": "Semgrep",
            "status": "completed",
            "language": "C/C++",
            "finding_count": len(findings),
            "findings": findings,
            "warning": (
                "Findings are potential issues requiring review, "
                "not automatically confirmed vulnerabilities."
            ),
        }

    except subprocess.TimeoutExpired:
        raise RuntimeError("Semgrep scan timed out after 120 seconds.")

    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)