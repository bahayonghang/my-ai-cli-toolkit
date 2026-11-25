"""Measure independent viewport observations for the local equipment-directory fixture."""

import argparse
import json
from pathlib import Path


def distinct_samples(samples):
    observed = {}
    for s in samples:
        key = (s["input"], s["state"], tuple(s["viewport"]), s["container"], s["scrollTop"])
        observed.setdefault(key, s)
    return list(observed.values())


# This fixture has one scrolling pane with no overlays or sticky header. Wait for
# three equal frame readings after an instant scroll before reading its actual offset.
SAMPLE = """async (requested) => {
    const pane = document.querySelector('#records');
    pane.scrollTo({top: requested, behavior: 'instant'});
    let previous, stable = 0;
    for (let i = 0; i < 60 && stable < 2; i++) {
        await new Promise(requestAnimationFrame);
        stable = pane.scrollTop === previous ? stable + 1 : 0;
        previous = pane.scrollTop;
    }
    if (stable < 2) throw new Error('Unstable directory scroll position');
    const box = pane.getBoundingClientRect();
    const left = box.left + pane.clientLeft, top = box.top + pane.clientTop;
    const inside = rect => rect.width > 0 && rect.height > 0
        && rect.left >= Math.max(0, left) && rect.top >= Math.max(0, top)
        && rect.right <= Math.min(innerWidth, left + pane.clientWidth)
        && rect.bottom <= Math.min(innerHeight, top + pane.clientHeight);
    const records = Array.from(pane.querySelectorAll('[data-record-id]'));
    const visible = el => el.checkVisibility({opacityProperty: true, visibilityProperty: true});
    const complete = records.filter(row => visible(row) && inside(row.getBoundingClientRect()));
    const actions = {};
    for (const row of complete) {
        actions[row.dataset.recordId] = Array.from(row.querySelectorAll('button'))
            .filter(button => {
                const rect = button.getBoundingClientRect();
                const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
                return visible(button) && inside(rect) && !button.disabled
                    && button.tabIndex >= 0 && button.contains(hit);
            }).map(button => button.dataset.action);
    }
    const picked = records.filter(row => row.querySelector('[aria-pressed="true"]'));
    return {input: location.pathname.split('/').pop(), viewport: [innerWidth, innerHeight],
        state: 'all; picked=' + picked.map(row => row.dataset.recordId).join(','),
        container: '#' + pane.id, requested, scrollTop: pane.scrollTop, scrollHeight: pane.scrollHeight,
        paneHeight: pane.clientHeight, ids: complete.map(row => row.dataset.recordId), actions};
}"""


def exercise_record(page, record_id):
    row = page.locator(f'[data-record-id="{record_id}"]')
    inspect = row.locator('[data-action="inspect"]')
    pick = row.locator('[data-action="pick"]')
    inspect.click()
    details = page.locator("output").inner_text()
    if not details.startswith(record_id + ":"):
        raise AssertionError(f"Inspect opened {details!r} for {record_id}")
    inspect.press("Tab")
    if not pick.evaluate("(el) => el === document.activeElement"):
        raise AssertionError(f"Tab did not reach Pick for {record_id}")
    page.keyboard.press("Space")
    picked = page.locator('[data-record-id]:has([aria-pressed="true"])')
    if picked.count() != 1 or picked.get_attribute("data-record-id") != record_id:
        raise AssertionError(f"Pick did not select only {record_id}")
    added = page.locator("output").inner_text()
    page.keyboard.press("Space")
    removed = page.locator("output").inner_text()
    if (picked.count() or added != f"{record_id} added to pick list"
            or removed != f"{record_id} removed from pick list"):
        raise AssertionError(f"Unexpected pick state or feedback for {record_id}")
    return dict(id=record_id, inspect=details, pick=added, undo=removed)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("page", type=Path)
    parser.add_argument("--channel", help="installed Chromium channel, e.g. msedge")
    parser.add_argument("--screenshots", type=Path, help="directory for first-screen PNGs")
    args = parser.parse_args()
    from playwright.sync_api import sync_playwright

    if args.screenshots:
        args.screenshots.mkdir(parents=True, exist_ok=True)
    samples, interactions = [], []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel=args.channel)
        version = browser.version
        for width, height in ((1440, 900), (390, 844)):
            page = browser.new_page(viewport={"width": width, "height": height})
            page.goto(args.page.resolve().as_uri())
            page.wait_for_selector('[data-record-id]')
            samples_here = [page.evaluate(SAMPLE, requested) for requested in (0, 0, 360)]
            unique = distinct_samples(samples_here)
            if [s["scrollTop"] for s in unique] != [0, 360]:
                raise AssertionError("Expected two comparable positions in this fixture")
            for sample in unique:
                if not sample["ids"] or any(set(actions) != {"inspect", "pick"}
                                             for actions in sample["actions"].values()):
                    raise AssertionError(f"Incomplete record actions: {sample}")
                page.evaluate(SAMPLE, sample["scrollTop"])
                if args.screenshots and sample["scrollTop"] == 0:
                    page.screenshot(path=args.screenshots / f"{args.page.stem}-{width}.png")
                result = exercise_record(page, sample["ids"][0])
                interactions.append(dict(viewport=[width, height], scrollTop=sample["scrollTop"], **result))
            samples.extend(unique)
            page.close()
        browser.close()
    print(json.dumps(dict(browser=version, requests=[0, 0, 360], observations=samples,
                          interactions=interactions), indent=2))


if __name__ == "__main__":
    main()
