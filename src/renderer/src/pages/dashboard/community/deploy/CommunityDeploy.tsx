import { FC, memo, useMemo } from 'react'

import { useDataStore } from '../../../../store/store.js'
import { Nav } from './Nav.js'
import { ReviewDeploy } from './ReviewDeploy.js'
import { SelectOrg } from './SelectOrg.js'
import { SelectRepo } from './SelectRepo.js'
import { Token } from './Token.js'

export const CommunityDeploy: FC = memo(function CommunityDeploy() {
  const state = useDataStore((s) => s.communityDeploy.state)

  const Component: FC = useMemo(() => {
    switch (state) {
      case 'deploy':
        return ReviewDeploy
      case 'provide-token':
        return Token
      case 'repo-select':
        return SelectRepo
      default:
        return SelectOrg
    }
  }, [state])

  return (
    <>
      <h2>Deploy Community</h2>
      <Nav />
      <Component />
    </>
  )
})
