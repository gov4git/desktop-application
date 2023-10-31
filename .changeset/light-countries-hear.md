---
'gov4git-desktop-app': patch
---

Correct pending credit calculation

- Should cost the difference in new credits spent
  and previous credits spent when switching vote from
  negative to positive or vice versa and should
  refund credits if that new cost is less than
  previous cost.
- Should refund credits when decreasing vote
