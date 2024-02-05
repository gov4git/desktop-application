import { StateCreator } from 'zustand'
import type {} from 'zustand/middleware/immer'

import { serialAsync } from '~/shared'

import { communityService } from '../services/CommunityService.js'
import { CommunityDeployStore, Store } from './types.js'

export const createCommunityDeployStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityDeployStore
> = (set, get) => ({
  communityDeploy: {
    state: 'initial',
    orgs: null,
    repos: null,
    selectedOrg: '',
    selectedRepo: '',
    communityPat: '',
    setState: (state) => {
      set((s) => {
        s.communityDeploy.state = state
      })
    },
    setRepo: (repo) => {
      set((s) => {
        s.communityDeploy.selectedRepo = repo
      })
    },
    setCommunityPat: (pat) => {
      set((s) => {
        s.communityDeploy.communityPat = pat
      })
    },
    fetchOrgs: serialAsync(async () => {
      set((s) => {
        s.communityDeploy.orgs = null
      })
      const orgs = await get().userInfo.fetchAdminOrgs()
      set((s) => {
        s.communityDeploy.orgs = orgs
      })
    }),
    selectOrg: serialAsync(async (org: string) => {
      set((s) => {
        s.communityDeploy.repos = null
      })
      let repos: string[] = []
      if (org !== '') {
        repos = await get().userInfo.fetchOrgRepos(org)
      }
      set((s) => {
        s.communityDeploy.selectedOrg = org
        s.communityDeploy.repos = repos
      })
    }),
    deployCommunity: serialAsync(async () => {
      const org = get().communityDeploy.selectedOrg
      const repo = get().communityDeploy.selectedRepo
      const token = get().communityDeploy.communityPat
      if (org !== '' && repo !== '' && token !== '') {
        await get().tryRun(async () => {
          await communityService.deployCommunity({
            org,
            repo,
            token,
          })
          await get().refreshCache()
        }, `Failed to deploy new community ${org}/${repo}.`)
      }
    }),
  },
})
