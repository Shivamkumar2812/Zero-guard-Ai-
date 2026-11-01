
def generate_suggestions(findings: list) -> list:
    suggestions = []

    for finding in findings:
        rule_id = finding.get("rule_id", "")
        message = finding.get("message", "")
        line = finding.get("line")

        suggestion = {
            "rule_id": rule_id,
            "line": line,
            "issue": message,
            "suggestion": "Review the flagged code and verify the input, buffer sizes, and intended behavior.",
            "example": None,
            "auto_fix_available": False,
        }

        if "insecure-use-scanf-fn" in rule_id:
            suggestion["suggestion"] = (
                "Avoid unbounded string input. For %s conversions, "
                "use a width limit based on the destination buffer size, "
                "or consider fgets() with appropriate input validation."
            )
            suggestion["example"] = (
                'char name[10];\n'
                'scanf("%9s", name);  /* Example only: '
                'the width must match the actual buffer size. */'
            )

        elif "insecure-use-string-copy-fn" in rule_id:
            suggestion["suggestion"] = (
                "Verify the destination capacity before copying. "
                "Prefer a bounded approach that accounts for the "
                "destination size and null termination."
            )
            suggestion["example"] = (
                "Check source length and destination capacity "
                "before copying; select an appropriate API for your platform."
            )

        suggestions.append(suggestion)

    return suggestions
