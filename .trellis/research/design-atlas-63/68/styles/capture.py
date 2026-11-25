"""Replay the two viewport / three plate / appearance checks for one page."""

import argparse
import hashlib
import io
import json
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright


def snap(page, path, full=False):
    image = Image.open(io.BytesIO(page.screenshot(full_page=full))).convert("RGB")
    image.save(path, format="WEBP", lossless=True)
    return image


def measure(locator):
    return locator.evaluate("""e => {
      const s=getComputedStyle(e), r=e.getBoundingClientRect();
      return {x:Math.round(r.x+scrollX), y:Math.round(r.y+scrollY), width:Math.round(r.width),
        height:Math.round(r.height), font:s.fontFamily, fontSize:s.fontSize, weight:s.fontWeight,
        colour:s.color, background:s.backgroundColor, border:s.borderTopWidth};
    }""")


def rendered_inks(page, bounds):
    photo = Image.open(io.BytesIO(page.screenshot(full_page=True))).convert("RGB")
    crop = photo.crop(
        (
            bounds["x"] + 1,
            bounds["y"] + 1,
            bounds["x"] + bounds["width"] - 1,
            bounds["y"] + bounds["height"] - 1,
        )
    )
    colours = dict(
        (colour, count) for count, colour in crop.getcolors(crop.width * crop.height)
    )
    return dict(
        kelp_pixels=colours.get((31, 65, 58), 0),
        oxide_pixels=colours.get((182, 82, 51), 0),
        paper=list(max(colours, key=colours.get)),
        rgb_sha256=hashlib.sha256(crop.tobytes()).hexdigest(),
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("page", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    results = {}
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="msedge", headless=True)
        results["browser"] = browser.version
        for name, w, h in [("desktop", 1440, 900), ("mobile", 390, 844)]:
            ctx = browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=1,
                color_scheme="light",
                reduced_motion="reduce",
            )
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(args.page.resolve().as_uri(), wait_until="load")
            page.wait_for_function(
                "Array.from(document.images).every(i=>i.complete && i.naturalWidth===1000 && i.naturalHeight===740)"
            )
            page.evaluate("document.fonts.ready")
            radio = {
                v: page.get_by_role("radio", name=v, exact=True)
                for v in ["Both plates", "Kelp", "Oxide"]
            }
            dark = page.get_by_role("button", name="Dark paper", exact=True)
            if not dark.count():
                dark = page.get_by_role("switch", name="Dark paper", exact=True)

            def hit_target(control):
                return control.evaluate_handle("e=>e.labels?.[0] || e").as_element()

            def pressed():
                return dark.evaluate(
                    "e=>e.getAttribute('aria-pressed') ?? e.getAttribute('aria-checked') ?? String(e.checked)"
                )

            assert pressed() == "false" and radio["Both plates"].is_checked()
            assert not page.evaluate("scrollX || scrollY")
            snap(page, args.output / (name + ".webp"))
            if name == "desktop":
                snap(page, args.output / "full.webp", full=True)
            img = page.locator('img[src$="kelp.png"]')
            initial = {
                label: measure(loc)
                for label, loc in [
                    (
                        "title",
                        page.get_by_role("heading", name="Low water", exact=True),
                    ),
                    ("description", page.get_by_text("A cut-paper coast", exact=False)),
                    ("art", img),
                    (
                        "live_caption",
                        page.get_by_text("Both plates on cream paper", exact=True),
                    ),
                    ("notes", page.get_by_text("Print notes", exact=True)),
                    ("dark_paper", dark),
                    ("oxide_target", hit_target(radio["Oxide"])),
                ]
            }
            cdp = ctx.new_cdp_session(page)
            cdp.send("DOM.enable")
            cdp.send("CSS.enable")
            document = cdp.send("DOM.getDocument")["root"]["nodeId"]
            title_node = cdp.send(
                "DOM.querySelector", {"nodeId": document, "selector": "h1"}
            )["nodeId"]
            initial["title"]["rendered_fonts"] = cdp.send(
                "CSS.getPlatformFontsForNode", {"nodeId": title_node}
            )["fonts"]
            bounds = initial["art"]
            assert abs(bounds["width"] / bounds["height"] - 1000 / 740) < 0.01
            assert (
                page.locator("body").inner_text().find("1,000 × 740 pixels per plate")
                >= 0
            )
            dimensions = page.evaluate(
                "({innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,scrollY})"
            )
            assert dimensions["scrollWidth"] == w
            states = {}
            for label, caption in [
                ("Both plates", "Both plates"),
                ("Kelp", "Kelp plate"),
                ("Oxide", "Oxide plate"),
            ]:
                if label != "Both plates":
                    hit_target(radio[label]).click()
                assert radio[label].is_checked()
                assert sum(v.is_checked() for v in radio.values()) == 1
                assert page.get_by_text(
                    caption + " on cream paper", exact=True
                ).is_visible()
                ink = rendered_inks(page, bounds)
                assert (ink["kelp_pixels"] > 100) == (label != "Oxide")
                assert (ink["oxide_pixels"] > 100) == (label != "Kelp")
                states[label] = ink
            radio["Oxide"].focus()
            page.keyboard.press("ArrowLeft")
            assert radio["Kelp"].is_checked()
            page.keyboard.press("ArrowRight")
            assert radio["Oxide"].is_checked()
            target = hit_target(radio["Oxide"])
            states["keyboard_after_right"] = page.evaluate(
                "document.activeElement.outerHTML.split('>').shift()+'>'"
            )
            region = target.bounding_box()
            assert region["width"] > 0 and region["height"] >= 24
            page.screenshot(
                path=str(args.output / (name + "-focus.png")),
                clip={
                    "x": max(0, region["x"] - 7),
                    "y": max(0, region["y"] - 7),
                    "width": min(w - max(0, region["x"] - 7), region["width"] + 14),
                    "height": region["height"] + 14,
                },
            )
            before = page.evaluate(
                "getComputedStyle(document.body).backgroundColor+' / '+getComputedStyle(document.documentElement).backgroundColor"
            )
            dark.click()
            assert pressed() == "true"
            after = page.evaluate(
                "getComputedStyle(document.body).backgroundColor+' / '+getComputedStyle(document.documentElement).backgroundColor"
            )
            assert before != after
            page.evaluate("window.scrollTo(0,0)")
            states["dark_oxide"] = rendered_inks(page, bounds)
            assert states["dark_oxide"]["rgb_sha256"] == states["Oxide"]["rgb_sha256"]
            snap(page, args.output / (name + "-dark-oxide.webp"))
            dark.click()
            assert pressed() == "false"
            common_scroll = None
            if name == "mobile":
                page.evaluate("window.scrollTo(0,8)")
                common_scroll = page.evaluate("scrollY")
                assert common_scroll == 8
                snap(page, args.output / "mobile-oxide-y8.webp")
            page.evaluate("window.scrollTo(0,160)")
            actual = page.evaluate("scrollY")
            if name == "mobile":
                snap(page, args.output / "mobile-oxide-scroll.webp")
            if name == "mobile":
                page.evaluate("window.scrollTo(0,0)")
                dark.click()
                hover = dark.evaluate("e=>getComputedStyle(e).backgroundColor")
                page.mouse.move(0, 0)
                rest = dark.evaluate("e=>getComputedStyle(e).backgroundColor")
                edge = page.locator("figure").evaluate(
                    "e=>({border:getComputedStyle(e).borderTopColor,shadow:getComputedStyle(e).boxShadow})"
                )
                page.emulate_media(forced_colors="active")
                on = dark.screenshot()
                (args.output / "forced-toggle-on.png").write_bytes(on)
                dark.click()
                page.mouse.move(0, 0)
                off = dark.screenshot()
                (args.output / "forced-toggle-off.png").write_bytes(off)
                assert on != off
                results["small_controls"] = dict(
                    dark_button_hover=hover,
                    dark_button_rest=rest,
                    dark_figure=edge,
                    forced_colors_pressed_distinct=True,
                )
            assert not errors, errors
            results[name] = dict(
                viewport=dimensions,
                initial=initial,
                states=states,
                appearance_surfaces=[before, after],
                requested_scroll_y=160,
                observed_scroll_y=actual,
                mobile_common_scroll_y=common_scroll,
                browser_errors=errors,
            )
            ctx.close()
        browser.close()
    (args.output / "measurements.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
