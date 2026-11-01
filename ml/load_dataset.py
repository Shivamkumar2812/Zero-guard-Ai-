
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
files = [
    "primevul_train.jsonl",
    "primevul_valid.jsonl",
    "primevul_test.jsonl",
]

for filename in files:
    path = DATA_DIR / filename
    print(f"\n{'=' * 50}")
    print("FILE:", filename)

    with path.open("r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= 2:
                break

            row = json.loads(line)

            if i == 0:
                print("Columns:", list(row.keys()))

            # Print values, limiting long source-code fields
            sample = {}
            for key, value in row.items():
                if isinstance(value, str) and len(value) > 250:
                    sample[key] = value[:250] + "... [truncated]"
                else:
                    sample[key] = value

            print(f"Example {i + 1}:", sample)

print("\nDataset inspection complete!")
