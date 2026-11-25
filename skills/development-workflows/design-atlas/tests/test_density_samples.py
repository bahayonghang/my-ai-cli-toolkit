"""The fixture counts distinct observed screens even when scroll requests clamp."""

import importlib.util
import unittest
from pathlib import Path


path = Path(__file__).parent / "fixtures/task-aware/density/measure.py"
spec = importlib.util.spec_from_file_location("density_measure", path)
measure = importlib.util.module_from_spec(spec)
spec.loader.exec_module(measure)


class DensitySampleTests(unittest.TestCase):
    def test_count_actual_positions_in_their_own_view(self):
        top = dict(input="cards.html", state="all", viewport=[390, 844],
                   container="#records", requested=0, scrollTop=0)
        bottom = {**top, "requested": 1000, "scrollTop": 780}
        clamped = {**bottom, "requested": 2000}
        narrow = {**top, "viewport": [320, 844]}
        picked = {**top, "state": "picked"}
        other_pane = {**top, "container": "#alternate"}
        other_input = {**top, "input": "comparison.html"}

        samples = [top, bottom, clamped, narrow, picked, other_pane, other_input, top]
        self.assertEqual(measure.distinct_samples(samples),
                         [top, bottom, narrow, picked, other_pane, other_input])
