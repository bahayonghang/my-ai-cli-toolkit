"""Measure the rendered proof desk. Requires Playwright, Chromium and Pillow."""

import argparse
import io
import json
from math import ceil, floor
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright


def luminance(rgb):
    channels = [value / 255 for value in rgb]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels]
    return sum(value * weight for value, weight in zip(linear, (.2126, .7152, .0722)))


def text_on_panel(notice):
    # The notice has a uniform background. Sample emitted pixels to include
    # ancestor backgrounds, transparency and font rasterization.
    image = Image.open(io.BytesIO(notice.screenshot())).convert("RGB")
    colours = image.getcolors(maxcolors=image.width * image.height)
    background = max(colours)[1]
    ink = max((rgb for _, rgb in colours), key=luminance)
    ratio = (luminance(ink) + .05) / (luminance(background) + .05)
    return {"background": background, "brightest_text": ink, "ratio": round(ratio, 2)}


def painted_focus(page, radio):
    """Compare the same checked label and its surrounding surface before and after blur."""
    label = radio.locator("..").bounding_box()
    crop = (floor(label["x"]) - 8, floor(label["y"]) - 8,
            ceil(label["x"] + label["width"]) + 8, ceil(label["y"] + label["height"]) + 8)

    def capture():
        return Image.open(io.BytesIO(page.screenshot())).convert("RGB").crop(crop)

    focused = capture()
    radio.blur()
    blurred = capture()
    visible = 0
    for y in range(focused.height):
        for x in range(focused.width):
            before, after = focused.getpixel((x, y)), blurred.getpixel((x, y))
            if before == after:
                continue
            low, high = sorted((luminance(before), luminance(after)))
            if (high + .05) / (low + .05) >= 3:
                visible += 1
    # In this static, 1x fixture a solid line one radio width long is a lower bound.
    return {"pixels_at_3_to_1": visible, "minimum_pixels": ceil(radio.bounding_box()["width"])}


def inspect(page, project, output, width):
    page.goto((project / "index.html").resolve().as_uri())
    page.keyboard.press("Tab")
    page.keyboard.press("ArrowRight")
    page.locator("input[value=b]:checked").wait_for()
    page.screenshot(path=output / f"selected-{width}.png")
    state = page.evaluate("""() => {
      const css = (selector) => getComputedStyle(document.querySelector(selector));
      const selected = document.querySelector("input:checked");
      const label = css("label:has(input:checked)");
      return {
        scrollY, width: innerWidth, height: innerHeight,
        legend: [".plate-a", ".plate-b"].map(c => css(".legend " + c + " .marker").backgroundColor),
        passes: Array.from(document.querySelectorAll(".passes li"), e => getComputedStyle(e).backgroundColor),
        shapes: [".plate-a", ".plate-b"].map(c => css(".legend " + c + " .marker").borderRadius),
        signature: css(".signature").color, rule: css(".order").borderTop,
        selected: selected.value, keyboardFocus: selected.matches(":focus-visible"),
        selectedLabel: [label.color, label.backgroundColor], ring: label.outline,
        note: document.querySelector("output").innerText
      };
    }""")
    state["disclosure"] = text_on_panel(page.locator(".proof-notice"))
    state["focusIndicator"] = painted_focus(page, page.locator("input[value=b]"))
    return state


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--channel", default="chromium")
    parser.add_argument("--check-clear", action="store_true")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as driver:
        browser = driver.chromium.launch(channel=args.channel)
        results = []
        for width, height in ((1440, 900), (390, 844)):
            page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
            results.append(inspect(page, args.project, args.output, width))
            page.close()
        report = {"engine": browser.version, "viewports": results}
        browser.close()
    print(json.dumps(report, indent=2))
    if args.check_clear:
        failures = []
        for state in results:
            prefix = f"{state['width']}px: "
            if state["disclosure"]["ratio"] < 4.5:
                failures.append(prefix + "revision notice contrast below 4.5")
            plate_a, plate_b = state["legend"]
            if state["passes"] != [plate_a, plate_b, plate_a]:
                failures.append(prefix + "legend colours disagree with passes")
            if state["signature"] != state["passes"][0] or state["selectedLabel"][1] != state["signature"]:
                failures.append(prefix + "press signature, marigold data or shared selection colour lost")
            if state["shapes"][0] == state["shapes"][1]:
                failures.append(prefix + "distinct legend shapes lost")
            if not state["keyboardFocus"] or state["note"] != "Iris · Mix before the second pass.":
                failures.append(prefix + "keyboard selection or mixing note lost")
            focus = state["focusIndicator"]
            if focus["pixels_at_3_to_1"] < focus["minimum_pixels"]:
                failures.append(prefix + "focus indicator is not visible on the checked control")
        if failures:
            raise SystemExit("\n".join(failures))


if __name__ == "__main__":
    main()
