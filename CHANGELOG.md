# gov4git-desktop-app

## 0.19.0

### Minor Changes

- 6341997: bump to gov4git v2.2.6

## 0.17.0

### Minor Changes

- 301adf0: upgrade to Gov4Git client v2.2.6

## 0.16.0

### Minor Changes

- 72c9e24: Upgrade to gov4git v2.2.5

### Patch Changes

- 0187f17: Add pull requests management
- 34e0a70: Add issue management
- 4f37427: Dynamically set protocol CLI version
- f102452: Add user management

## 0.15.6

### Patch Changes

- 3ff310e: Filter out deleted communities

  - Addresses #114, #128

- 4946f12: Add option to remove communities

  - Addresses #127

## 0.15.5

### Patch Changes

- c5337e1: Fix number formatting and NaN issue

## 0.15.4

### Patch Changes

- a314c71: Upgrade Gov4Git CLI to v2.2.2

## 0.15.3

### Patch Changes

- b5965cd: Increase max buffer limit

## 0.15.2

### Patch Changes

- fa5c1f0: Update pull requests labels
- a03a917: Add foundation for management dashboard

## 0.15.1

### Patch Changes

- a56525e: Refresh user on cache refresh
- cb99df5: Hide site nav for unauthorized users

## 0.15.0

### Minor Changes

- 79a34f7: Add community dashboard
- 5bbb50b: Add policy service

  - Add policy info to GH issues
  - Add policy option to management of issues.

### Patch Changes

- a0767a4: Fix initializing id repos

  - Addresses #109

## 0.14.0

### Minor Changes

- f5d4dc5: Upgrade Gov4Git CLI to v2.2.0

## 0.13.2

### Patch Changes

- d5401fd: Fix error screen

  - Clear loaders after error.

## 0.13.1

### Patch Changes

- fa160df: Refactor data sync

## 0.13.0

### Minor Changes

- 1ba2223: Upgrade Gov4Git cli to v2.1.5
- 9879632: Improve styling
- bf3ddff: Add voting credits hover over tip.

  - Addresses gov4git/roadmap#8

### Patch Changes

- 5d78926: Refactor data syncing
- cad8f0b: Fix view all issues/prs in GitHub link

  - Correctly label and link to PRs when proposals are selected

- 64cd10b: Hide site nav until user has logged in.

  - Addresses gov4git/roadmap#7

- 358591a: Fix data race
- 01c4b7e: Fix deployment version
- d12ba7c: Show message when user has 0 voting credits.

## 0.12.0

### Minor Changes

- 22e596b: Upgrade Gov4Git CLI to v2.1.2

## 0.11.5

### Patch Changes

- 69b68d9: Provide ability to download/save logs.

## 0.11.4

### Patch Changes

- 0e6cdda: Improve error handling

## 0.11.3

### Patch Changes

- 1df47a4: Upgrade Gov4Git CLI to v2.0.3
- 2151a6d: Fix filtering

  - Addresses #78

## 0.11.2

### Patch Changes

- 71e8082: Update Gov4Git to v2.0.2

## 0.11.1

### Patch Changes

- 51577f8: Refactor state management

## 0.11.0

### Minor Changes

- 0764a53: Add deploy community

  - Addresses gov4git/gov4git#141

### Patch Changes

- 1d72dc0: Upgrade git service to use Octokit
- ffc168d: Revalidate user and community settings on error

## 0.10.0

### Minor Changes

- 2c6654a: Upgrade to v2 protocol

## 0.9.2

### Patch Changes

- d634208: Cleanup logging
- bc3ad7f: Parameterize SQL queries
- a5df269: Fix vote response.

  - Update user credits from source instead of cache

## 0.9.1

### Patch Changes

- 5f22ca3: Fix login form

  - Allow updating PAT.

## 0.9.0

### Minor Changes

- b8529ed: Update auth flow

  - Separate out user login and joining communities
    to allow for joining multiple communities.
  - Submit GH request to join from UI.
    Addresses gov4git/gov4git#118

- 5f1a77e: Support multiple communities

  - Addresses gov4git/gov4git#121

- 6e8aeba: Add ballot filters

  - Support filtering by ballot status (open, closed, etc)
  - Support filteringer by participation (voted, not voted)
  - Addresses gov4git/gov4git#109, gov4git/gov4git#110, gov4git/gov4git#131

### Patch Changes

- 45d6c20: Centralize utility functions
- 2aa7fca: Pin header

## 0.8.1

### Patch Changes

- 4629b4b: Cleanup deps

## 0.8.0

### Minor Changes

- e2b17d2: Improve cache layer

  - Cache user, communities, and settings

## 0.7.0

### Minor Changes

- 4c69872: Run Gov$git CLI with verbose flag

  - Addresses gov4git/gov4it#128

### Patch Changes

- 4c0fb7d: Reset cache on user updates

## 0.6.4

### Patch Changes

- a5677c4: Check PAT privileges prior to logging in.

  - Addresses #39, #40, and gov4git/gov4git#133

## 0.6.3

### Patch Changes

- aa3dd3e: Update gov4git cli to v1.1.14

## 0.6.2

### Patch Changes

- 84fab8d: Update docs

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
