import json
import re
import sys


def check_structure(file_path):
    report = {"status": "success", "issues": [], "metrics": {}}

    try:
        with open(file_path, encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return {"status": "error", "message": str(e)}

    # 1. Abstract Check
    # Look for "Abstract" header/start
    abstract_match = re.search(r"Abstract[—:-](.*?)(Index Terms|Introduction|I\.|1\.)", content, re.DOTALL | re.IGNORECASE)
    if abstract_match:
        abstract_text = abstract_match.group(1).strip()
        word_count = len(abstract_text.split())
        report["metrics"]["abstract_word_count"] = word_count
        if word_count < 150:
            report["issues"].append(f"Abstract is too short ({word_count} words). Minimum is 150.")
        elif word_count > 250:
            report["issues"].append(f"Abstract is too long ({word_count} words). Maximum is 250.")
    else:
        report["issues"].append(
            "Could not automatically detect 'Abstract' section. Ensure it starts with 'Abstract—' or similar."
        )

    # 2. Section Check
    required_sections = ["Introduction", "Conclusion", "References"]
    missing_sections = []
    for sec in required_sections:
        if not re.search(rf"\b{sec}\b", content, re.IGNORECASE):
            missing_sections.append(sec)

    if missing_sections:
        report["issues"].append(f"Missing required sections: {', '.join(missing_sections)}")

    # 3. Tone Guard (Forbidden Words)
    forbidden_words = [
        "very",
        "amazing",
        "totally",
        "huge",
        "incredible",
        "unfortunately",
        "obviously",
        "surprisingly",
        "a lot of",
        "kind of",
        "basically",
        "actually",
        "I think",
        "I believe",
        "I feel",
    ]

    found_forbidden = []
    for word in forbidden_words:
        # Simple word boundary check
        matches = re.findall(rf"\b{re.escape(word)}\b", content, re.IGNORECASE)
        if matches:
            found_forbidden.append(f"{word} ({len(matches)})")

    if found_forbidden:
        report["issues"].append(f"Found forbidden/non-academic words: {', '.join(found_forbidden)}")

    return report


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No file provided"}))
        sys.exit(1)

    result = check_structure(sys.argv[1])
    print(json.dumps(result, indent=2))
