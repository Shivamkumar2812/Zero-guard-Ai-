
import json
from pathlib import Path
from collections import Counter

DATA_DIR = Path(__file__).parent / "data"

for split in ["train", "valid", "test"]:
    path = DATA_DIR / f"primevul_{split}.jsonl"

    counts = Counter()
    total = 0
    empty_functions = 0

    print(f"\nChecking {split} dataset...")

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            row = json.loads(line)
            counts[row["target"]] += 1
            total += 1

            if not row.get("func", "").strip():
                empty_functions += 1

    print("Total examples:", total)
    print("Non-vulnerable (target 0):", counts[0])
    print("Vulnerable (target 1):", counts[1])
    print("Empty functions:", empty_functions)

    if total:
        print("Vulnerable percentage:",
              round(counts[1] * 100 / total, 2), "%")

print("\nDataset statistics complete!")
