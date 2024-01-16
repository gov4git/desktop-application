import 'dotenv/config'

import { resolve } from 'path'

const user = {
  username: process.env['GH_USER']!,
  pat: process.env['GH_TOKEN']!,
}

const baseUrl = 'https://github.com'
const identityName = 'test-gov4git-identity'
const projectRepo = `${baseUrl}/${user.username}/test-gov4git-project-repo`
const communityUrl = `${projectRepo}-gov.public.git`
const privateCommunityUrl = `${projectRepo}-gov.private.git`
const publicRepo = `${baseUrl}/${user.username}/${identityName}-public.git`
const privateRepo = `${baseUrl}/${user.username}/${identityName}-private.git`

const configDir = resolve(__dirname, 'config')
const dbPath = resolve(configDir, 'gov4git.db')
export const config = {
  user,
  baseUrl,
  identityName,
  projectRepo,
  communityUrl,
  privateCommunityUrl,
  publicRepo,
  privateRepo,
  configDir,
  dbPath,
}
