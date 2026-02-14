"""InstallModal interaction regression tests."""

import asyncio

from textual.app import App, ComposeResult
from textual.widgets import Input, Static

from tui.components.install_modal import InstallModal


class _InstallModalHostApp(App):
    def compose(self) -> ComposeResult:
        yield Static("root")


def test_hidden_path_input_not_in_focus_chain() -> None:
    async def _run() -> None:
        app = _InstallModalHostApp()
        async with app.run_test(size=(120, 40)) as pilot:
            app.push_screen(InstallModal(platform="claude", items=["demo-skill"]))
            await pilot.pause()

            modal = app.screen
            path_input = modal.query_one("#path-input", Input)
            assert path_input.can_focus is False

            await pilot.press("tab")
            await pilot.pause()
            assert getattr(modal.focused, "id", None) == "btn-install"

    asyncio.run(_run())


def test_directory_mode_focuses_input_and_accepts_typing() -> None:
    async def _run() -> None:
        app = _InstallModalHostApp()
        async with app.run_test(size=(120, 40)) as pilot:
            app.push_screen(InstallModal(platform="claude", items=["demo-skill"]))
            await pilot.pause()

            modal = app.screen
            await pilot.click(modal.query_one("#radio-directory"))
            await pilot.pause()
            await pilot.pause()

            path_input = modal.query_one("#path-input", Input)
            assert path_input.can_focus is True
            assert path_input.has_focus is True

            # Move focus away, then type; modal should redirect typing to path input.
            await pilot.press("tab")
            await pilot.pause()
            assert getattr(modal.focused, "id", None) == "btn-install"

            await pilot.press("a", "b", "c")
            await pilot.pause()

            assert path_input.has_focus is True
            assert path_input.value == "abc"

    asyncio.run(_run())
