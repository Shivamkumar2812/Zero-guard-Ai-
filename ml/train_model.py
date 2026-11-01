
import json
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    average_precision_score
)
from sklearn.pipeline import Pipeline

DATA_DIR = Path(__file__).parent / "data"
MODEL_DIR = Path(__file__).parent / "models"


def load_data(split):
    path = DATA_DIR / f"primevul_{split}.jsonl"
    codes = []
    labels = []

    print(f"Loading {split} data...")

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            row = json.loads(line)
            code = row.get("func", "")
            label = int(row["target"])

            if code.strip():
                codes.append(code)
                labels.append(label)

    print(f"Loaded {len(codes)} examples.")
    return codes, labels


X_train, y_train = load_data("train")
X_valid, y_valid = load_data("valid")

print("\nBuilding ML pipeline...")

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        analyzer="char",
        ngram_range=(3, 5),
        max_features=100000,
        sublinear_tf=True,
        dtype=float
    )),
    ("classifier", LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42
    ))
])

print("\nTraining model...")
model.fit(X_train, y_train)

print("\nEvaluating on validation data...")
predictions = model.predict(X_valid)
probabilities = model.predict_proba(X_valid)[:, 1]

print("\nClassification report:")
print(classification_report(
    y_valid,
    predictions,
    labels=[0, 1],
    target_names=["Non-vulnerable", "Vulnerable"],
    zero_division=0
))

print("Confusion matrix:")
print(confusion_matrix(y_valid, predictions, labels=[0, 1]))

print(
    "Average precision:",
    round(average_precision_score(y_valid, probabilities), 4)
)

MODEL_DIR.mkdir(parents=True, exist_ok=True)
model_path = MODEL_DIR / "primevul_baseline.joblib"
joblib.dump(model, model_path)

print(f"\nModel saved to: {model_path}")
