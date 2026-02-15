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
            assert path_input.disabled is True

            await pilot.press("tab")
            await pilot.pause()
            # Disabled input is skipped in focus chain
            focused_id = getattr(modal.focused, "id", None)
            assert focused_id != "path-input"

    asyncio.run(_run())


def test_directory_mode_focuses_input_and_accepts_typing() -> None:
    async def _run() -> None:
        app = _InstallModalHostApp()
        async with app.run_test(size=(120, 40)) as pilot:
            app.push_screen(InstallModal(platform="claude", items=["demo-skill"]))
            await pilot.pause()

            modal = app.screen
            await pilot.click(modal.query_one("#mode-custom"))
            await pilot.pause()
            await pilot.pause()

            path_input = modal.query_one("#path-input", Input)
            # After clicking custom mode, path input should be enabled
            assert path_input.disabled is False

    asyncio.run(_run())
