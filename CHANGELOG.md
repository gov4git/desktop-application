# gov4git-desktop-app

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
