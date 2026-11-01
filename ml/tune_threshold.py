
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    average_precision_score
)

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_PATH = BASE_DIR / "models" / "primevul_baseline.joblib"

print("Loading saved model...")
model = joblib.load(MODEL_PATH)

codes = []
labels = []

print("Loading validation data...")
with (DATA_DIR / "primevul_valid.jsonl").open(
    "r", encoding="utf-8"
) as file:
    for line in file:
        row = json.loads(line)
        code = row.get("func", "")

        if code.strip():
            codes.append(code)
            labels.append(int(row["target"]))

y_true = np.array(labels)

print("Calculating prediction probabilities...")
probabilities = model.predict_proba(codes)[:, 1]

print(
    "\nAverage precision:",
    round(average_precision_score(y_true, probabilities), 4)
)

print("\nThreshold comparison")
print("-" * 75)
print(
    f"{'Threshold':>10} {'Precision':>10} "
    f"{'Recall':>10} {'F1':>10} {'False alarms':>14}"
)
print("-" * 75)

for threshold in [0.05, 0.10, 0.15, 0.20, 0.25,
                  0.30, 0.40, 0.50, 0.60, 0.70]:
    predictions = (probabilities >= threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(
        y_true, predictions, labels=[0, 1]
    ).ravel()

    precision = precision_score(
        y_true, predictions, zero_division=0
    )
    recall = recall_score(
        y_true, predictions, zero_division=0
    )
    f1 = f1_score(
        y_true, predictions, zero_division=0
    )

    print(
        f"{threshold:>10.2f} {precision:>10.3f} "
        f"{recall:>10.3f} {f1:>10.3f} {fp:>14}"
    )

print("\nThreshold tuning complete.")
