
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    average_precision_score
)

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_PATH = BASE_DIR / "models" / "primevul_baseline.joblib"

THRESHOLD = 0.70

print("Loading trained model...")
model = joblib.load(MODEL_PATH)

codes = []
labels = []

print("Loading test dataset...")

with (DATA_DIR / "primevul_test.jsonl").open(
    "r", encoding="utf-8"
) as file:
    for line in file:
        row = json.loads(line)
        code = row.get("func", "")

        if code.strip():
            codes.append(code)
            labels.append(int(row["target"]))

y_true = np.array(labels)

print(f"Test examples: {len(y_true)}")
print("Generating predictions...")

probabilities = model.predict_proba(codes)[:, 1]
predictions = (probabilities >= THRESHOLD).astype(int)

print(f"\nThreshold: {THRESHOLD}")
print("\nClassification report:")
print(classification_report(
    y_true,
    predictions,
    labels=[0, 1],
    target_names=["Non-vulnerable", "Vulnerable"],
    zero_division=0
))

print("Confusion matrix (actual rows, predicted columns):")
print(confusion_matrix(y_true, predictions, labels=[0, 1]))

print(
    "\nAverage precision:",
    round(average_precision_score(y_true, probabilities), 4)
)

print("\nFinal test evaluation complete!")
