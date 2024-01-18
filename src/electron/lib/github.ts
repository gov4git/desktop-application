import validator from 'validator'

export type RepoSegments = {
  owner: string
  repo: string
}
export function urlToRepoSegments(repoUrl: string): RepoSegments {
  throwIfNotUrl(repoUrl)
  const repoParts = repoUrl.split('/')
  const parts = {
    owner: repoParts.at(-2) ?? '',
    repo: repoParts.at(-1)?.replace(/\.git$/i, '') ?? '',
  }
  if (parts.owner === '' || parts.repo === '') {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`)
  }
  return parts
}

function isUrl(repo: string): boolean {
  return validator.isURL(repo)
}

function throwIfNotUrl(repoUrl: string) {
  if (!isUrl(repoUrl)) {
    throw new Error(`${repoUrl} is not a valid URL.`)
  }
}
