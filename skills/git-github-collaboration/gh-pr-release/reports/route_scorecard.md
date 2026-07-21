# Route Scorecard

- total cases: `10`
- accuracy: `1.0`
- ambiguous cases: `0`
- no-route accuracy: `1.0`

## Route Metrics

| Route | Expected | Predicted | Precision | Recall | Avg Margin |
| --- | ---: | ---: | ---: | ---: | ---: |
| `gh-pr-release` | 4 | 4 | 1.0 | 1.0 | 0.956 |
| `no_route` | 6 | 6 | 1.0 | 1.0 | - |

## Confusion Matrix

| Expected \ Predicted | `gh-pr-release` | `no_route` |
| --- | ---: | ---: |
| `gh-pr-release` | 4 | 0 |
| `no_route` | 0 | 6 |

## Ambiguous Cases

| Family | Expected | Predicted | Margin |
| --- | --- | --- | ---: |
| - | - | - | - |
