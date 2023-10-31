# gov4git-desktop-app

## 0.6.1

### Patch Changes

- 03ecd06: Update gov4git dependency to v1.1.13
- 421c403: Improve error handling

  - Report voting errors within the vote window
  - Scroll to top of the page when error logs are presented

## 0.6.0

### Minor Changes

- a7e0fa1: Generalize dismiss message and message styling
- 21b416b: Update voting mechanism

  - Cleanup rank column so show current priority
    and user contribution/pending contribution
  - Move voting to ballot description for more space
  - Switch from slider mechanism to input box for better
    control and accessibility
  - Add increment and decrement buttons for easy control
  - Show quadratic relationship between vote and cost
    in credits via a slider
  - Show success message upon voting and indicate
    pending status of the new vote

### Patch Changes

- 3897078: Fix bubble style and support disabled state
- 032d881: Do not log logging activity

  - Previous versions logged logging activity
    creating an explosion of data to be written to files
    and degrading performance.

- 7600944: Correct pending credit calculation

  - Should cost the difference in new credits spent
    and previous credits spent when switching vote from
    negative to positive or vice versa and should
    refund credits if that new cost is less than
    previous cost.
  - Should refund credits when decreasing vote

- 1a5372a: Support mismatched username cases

  - Use the casing as listed in the g4g CLI
    protocol as the CLI is case sensitive

- 2bb1dfc: Catch app update errors
- 3cd1a8b: Remove calculating confirmation message on backend
- 8835b1c: Fetch user data after refreshing ballot cache

## 0.5.2

### Patch Changes

- bac97e5: Fix scroller bubble position

## 0.5.1

### Patch Changes

- dc265b5: Fix pull request page heading

## 0.5.0

### Minor Changes

- 52fd07f: Provide context

  - Provide links for viewing issues and pull requests in GitHub

- f49225b: Open external links in default web browser

## 0.4.1

### Patch Changes

- 5dd1de9: Fix path reference. Static assets need to be references relatively for electron fs.

## 0.4.0

### Minor Changes

- a016e2a: List individual ballots as cards
- 118060f: Add app refresh button
- 5d05ba9: Add login instructions
- 336ecc3: Add page headings

### Patch Changes

- c6525ca: Catch ballot is closed exception and present friendlier message.
- 6acd879: Update confirmation message

  - Notify users when credits are being restored/returned.
  - Present cost as an absolute value, removing negative sign
    for down voting.

- 30845c9: Fix typo

## 0.3.0

### Minor Changes

- 6d48077: Clear cache on app update

  - Client side code may be expecting new data
    types after updates so clear cache when updating.

- 7e955ea: Add cache clearing

## 0.2.2

### Patch Changes

- f35ec44: fix negative voting

  - account for the sign/direction of votes

- ad7863e: remove pending ballots that have been tallied

  - Due to timing, ballots may still appear pending after
    being tallied by the community. Remove them from being double
    counted.

## 0.2.1

### Patch Changes

- c341762: Fix AppUpdater service

## 0.2.0

### Minor Changes

- 48fd225: Add AppUpdater service

### Patch Changes

- 1228758: Auto refresh user info
- b09a034: Wrap gov service cli in error boundary

## 0.1.1

### Patch Changes

- c606e73: Remove waiting on cache update.

## 0.1.0

### Minor Changes

- 3108ccd: Initial release
