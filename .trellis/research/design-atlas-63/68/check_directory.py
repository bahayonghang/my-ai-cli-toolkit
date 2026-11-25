"""Replay #68's directory inventory and scroll checks. Requires Playwright and Chromium."""

import argparse
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[4]
DENSITY = ROOT / "skills/development-workflows/design-atlas/tests/fixtures/task-aware/density"
sys.path.insert(0, str(DENSITY))
from measure import SAMPLE, distinct_samples, exercise_record


def ids(first, last):
    return [f"FE-{i:02}" for i in range(first, last + 1)]


# Whole records recorded at actual offsets 0 and 360 in the original #66 run.
VISIBLE = {
    ("cards.html", 1440): [(1, 5), (4, 7)],
    ("cards.html", 390): [(1, 4), (4, 7)],
    ("comparison.html", 1440): [(1, 13), (8, 19)],
    ("comparison.html", 390): [(1, 6), (5, 10)],
}


def verify(page, filename, width):
    page.goto((DENSITY / filename).as_uri())
    rows = page.locator("[data-record-id]")
    rows.first.wait_for()
    inventory = rows.evaluate_all("""rows => rows.map(row => ({
        id: row.dataset.recordId,
        actions: [...row.querySelectorAll('button')].map(button => button.getAttribute('aria-label')),
        name: row.querySelector('h2').textContent
    }))""")
    assert [row["id"] for row in inventory] == ids(1, 24)
    for row in inventory:
        assert row["actions"] == ["Inspect " + row["name"], "Pick " + row["name"]], row

    requests = [0, 0, 360, 100000, 200000]
    samples = [page.evaluate(SAMPLE, offset) for offset in requests]
    actual = [sample["scrollTop"] for sample in samples]
    assert actual[:3] == [0, 0, 360] and actual[3] == actual[4] > 360, actual
    distinct = distinct_samples(samples)
    assert [sample["scrollTop"] for sample in distinct] == [0, 360, actual[-1]]
    for sample, bounds in zip(distinct, VISIBLE[filename, width]):
        assert sample["ids"] == ids(*bounds), (filename, width, sample)
    assert actual[-1] == samples[-1]["scrollHeight"] - samples[-1]["paneHeight"]
    for sample in distinct:
        assert sample["actions"] == {key: ["inspect", "pick"] for key in sample["ids"]}
        page.evaluate(SAMPLE, sample["scrollTop"])
        exercise_record(page, sample["ids"][0])

    return dict(page=filename, viewport=page.viewport_size, inventory=len(inventory),
                requested=requests, actual=actual,
                whole_record_ids=[sample["ids"] for sample in distinct],
                actions_per_id=["inspect", "pick"],
                exercised=[sample["ids"][0] for sample in distinct])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--channel", help="installed Chromium channel, e.g. msedge")
    args = parser.parse_args()
    observations = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel=args.channel)
        for filename, width in VISIBLE:
            height = 900 if width == 1440 else 844
            page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
            observations.append(verify(page, filename, width))
            page.close()
        print(json.dumps(dict(browser=browser.version, observations=observations), indent=2))
        browser.close()


if __name__ == "__main__":
    main()
