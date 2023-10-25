# gov4git-desktop-app

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
