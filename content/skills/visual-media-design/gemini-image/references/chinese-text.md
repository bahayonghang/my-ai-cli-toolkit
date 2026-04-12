# Chinese Text Handling Tips

AI image generation has limitations with Chinese text. These tips can improve accuracy.

## Prompt Tips

| Tip | Example | Notes |
|-----|---------|-------|
| Specify exact characters | Change "肥" to "爬" | Better than "fix typo" |
| Use quotes to mark text | Change「又要肥楼了」to「又要爬楼了」| Clearly mark original and target |
| Emphasize single change | Only change this one character, keep everything else | Avoid full redraw |
| One change at a time | Don't request multiple text changes at once | Reduce complexity |

## Recommended Prompt Template

```
image_URL The yellow dialog box in the top left says「original text」, please change「X」to「Y」, making it「target text」. Only change this one character, keep everything else unchanged.
```

## Notes

1. **Multiple attempts**: Same prompt may need 2-3 tries due to AI randomness
2. **Check results**: Always verify text correctness after generation
3. **Source quality**: Clearer original text = easier for AI to recognize and preserve
4. **Simplify**: Split complex multi-edit requests into separate single edits
