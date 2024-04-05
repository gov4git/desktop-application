# Updating GitRules

## Updating @gov4git/js-client NPM package

This project uses the [@gov4git/js-client](https://www.npmjs.com/package/@gov4git/js-client) npm package for working with GitRules. As such, a new version of the npm package needs to be released whenever GitRules releases a new version. View https://github.com/gov4git/js-client for information on how to releaes a new version of the npm package.

## Updating this project

When there is a newer version of the npm package to use, update the @gov4git/js-client dependency version in `package.json` on a new git branch and then run `npm install`. Then follow the [git flow](git-flow.md) instructions for creating a changeset entry for the update. The next release will then be on the new version of GitRules.
