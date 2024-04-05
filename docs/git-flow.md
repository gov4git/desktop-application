# Git Flow

## Create a new branch to make changes

```bash
git checkout -b <BRANCH_NAME>
```

## Descripe the changes

After making the necessary changes run the following command to describe the changes.
This project uses [semantic versioning](https://semver.org/) to describe changes.
The following command will walk you through describing the changes in terms of semantic versioning.

```bash
npm run release:changeset
```

## Commit changes.

Add and commit your changes along with the newly created files in the `.changeset` directory.
Be sure to commit the changeset files with the files that they describe.

```bash
git add .
git commit
```

## Optional rebase flow

You may also use a [git rebase](https://www.sitepoint.com/git-interactive-rebase-guide/) flow if making a lot of commits while developing in order to describe all the changes at the end.

```bash
npm run release:changeset # describe all the changes for the entire PR/set of commits
git add .
git commit
git rebase -i main
```

Select to squash your commit into 1 that includes the changest commit.

> [!NOTE]
> Git rebasing should only happen for local dev branches as it changes the git history.

## Publishing a new version (maintainers)

### Checkout main

```bash
git checkout main
```

### Apply changeset changes

This command will iterate through the changeset files in `.changeset` and apply the appropriate semantic versioning updates to the project and document the changes in `CHANGELOG.md`.

```bash
npm run release:version
```

> [!CAUTION]
> This will change several files in the project. Do **NOT** commit these files to the main branch.

### Checkout a releases branch

Checkout a releases branch that matches the version in `package.json`. Be sure to name the branch `releases/v<NEW_VERSION>` where `<NEW_VERSION>` is replaced with the new version in `package.json` that was applied after running `npm run release:version`. The CI/CD actions in GitHub relies on this naming scheme for building and publishing new releases.

```bash
git checkout -b releases/v<NEW_VERSION>
```

### Add and commit the changed files

```bash
git add .
git commit
```

### Apply git version tag

This command will add a new git tag matching the new version. This tag is used in the CI/CD GitHub actions for building and publishing new releases.

```bash
npm run release:tag
```

### Push and PR the releases branch

Push the new releases branch to the main repo.

```bash
git push origin releases/v<NEW_VERSION> --follow-tags
```

> [!CAUTION]
> Be sure to include the `--follow-tags` flag when pushing the branch. This will push up the newly created git tag. Both the git tag and naming scheme of the releases branch are vital to the CI/CD release process.

Then create a PR against the main branch. This starts GitHub actions that build and publish a new release of the application.
The actions can take upwards of 45 minutes to run.

### Publish the new release

After the GitHub actions finish running, there will be a new draft release in the [releases page](https://github.com/gov4git/desktop-application/releases).

To publish the new release:

1. Edit the draft release
2. Copy the appropriate changes from `CHANGELOG.md` to the release description.
3. Make sure the **Set as the latest release** option is selected.
4. Update the release

This will make the new release public. Existing desktop applications will find and update to the new release when running.
