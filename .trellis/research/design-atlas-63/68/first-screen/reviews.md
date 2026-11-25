# Fresh-context page reviews

Each session received the candidate review prompt, contract, source and actual desktop, narrow and full desktop screenshots. Initial paired runs and subsequent fixes are separate in the comparison.

## Index build

Session `01a21085-b276-79b1-b6fd-eab36a8e8dad`.

```text
ship
```

## Workshop R1

Session `01a21083-8067-77b2-b7f5-92706d023725`.

```text
fix

#reserve · “Reserve a seat” implies a real booking, but the preview disclosure appears only after the click · Rename the button “Preview seat reservation” so visitors know what it opens.
```

## Workshop R2

Session `01a21086-c311-73c2-b3a4-71e5214ac52a`.

```text
fix

#seats · Typing 0 or 5 leaves an out-of-range count in the preview with no visible error. · Show “Choose 1–4 seats” beside the field when the count falls outside the stated range and associate the message with the input.

Workshop schedule · “Saturday, 10:00–12:00” leaves visitors guessing which Saturday the $18 seat is for. · Give the calendar date, or say “Every Saturday” if the workshop recurs.
```

Builder follow-up, verbatim.

```text
Renamed the button to **Preview seat reservation**. At 1440×900 and 390×844, the first-screen screenshots matched the supplied references outside the button.

Verified that pressing Enter on desktop and clicking at mobile width both reveal the preview disclosure and move focus to the seat-count field.
```

## Workshop R3

Session `01a2108b-383b-7b02-8bb4-a1f934cac5a3`.

```text
fix

Workshop schedule · “Saturday” gives visitors no way to tell which session they’re previewing · Show the confirmed calendar date beside the time, or label the date as pending until it is confirmed.
Workshop description · “A single gathering” assumes visitors already know bookbinding terminology · Use “Fold, pierce and sew one set of nested sheets into a pamphlet.”
```

Builder follow-up, verbatim.

```text
The preview now shows **“Choose 1–4 seats”** beside the quantity field for invalid entries. The message is associated with the input and clears as soon as the visitor enters a valid whole number from 1 to 4.

The schedule still reads **“Saturday, 10:00–12:00 · $18 per seat”**, followed by **“Calendar date unavailable.”**

Verified in headless Edge at 390px and 1440px: keyboard opening and focus, typing `0`, `5`, a fraction or a blank, and returning to a valid count by typing or using the arrow key. Independent visual review passed.
```

The coordinator replayed the [two follow-up edits](review-followup.patch) in Edge. At 390 × 844, Enter opened the preview and focused #seats. Values 0 and 5 showed the associated error, and 2 cleared it. [Invalid value in the local preview](followup-quantity.png)

The three-round limit was reached. R3 still asked for a confirmed date or pending-date label, and plainer wording for “a single gathering.” The fixture supplies a weekday, time and price and no confirmed calendar date. These editorial suggestions remain open for the preview. In the final follow-up the button was wholly visible at all three tested sizes. Both paired, unchanged-input results are preserved above this follow-up.
