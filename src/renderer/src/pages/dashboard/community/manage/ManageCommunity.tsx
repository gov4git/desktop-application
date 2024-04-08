import { type FC, memo, useMemo } from 'react'

import { useDataStore } from '../../../../store/store.js'
import { IssuesPanel } from './issues/IssuesPanel.js'
import { ManageCommunityOverview } from './overview/ManageCommunityOverview.js'
import { PullRequestsPanel } from './pullRequests/PullRequestsPanel.js'
import { UserPanel } from './users/UserPanel.js'

export const ManageCommunity: FC = memo(function ManageCommunity() {
  const communityManageState = useDataStore((s) => s.communityManage.state)

  const Component: FC = useMemo(() => {
    switch (communityManageState) {
      case 'users':
        return UserPanel
      case 'issues':
        return IssuesPanel
      case 'pull-requests':
        return PullRequestsPanel
      default:
        return ManageCommunityOverview
    }
  }, [communityManageState])

  return (
    <>
      <Component />
    </>
  )
})
