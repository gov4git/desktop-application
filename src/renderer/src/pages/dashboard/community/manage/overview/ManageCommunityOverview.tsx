import { Card } from '@fluentui/react-components'
import { FC } from 'react'

import { useDataStore } from '../../../../../store/store.js'
import { useManageCommunityOverviewStyles } from './ManageCommunityOverview.styles.js'

export const ManageCommunityOverview: FC = function ManageCommunityOverview() {
  const styles = useManageCommunityOverviewStyles()
  const setCommunityManageState = useDataStore(
    (s) => s.communityManage.setState,
  )

  return (
    <div className={styles.container}>
      <Card
        size="small"
        className={styles.card}
        onClick={() => setCommunityManageState('users')}
      >
        <h3>Manage Users</h3>
        <div>
          View active users, issue voting credits, and manage requests to join
          the community.
        </div>
      </Card>
      <Card
        size="small"
        className={styles.card}
        onClick={() => setCommunityManageState('issues')}
      >
        <h3>Manage Issues</h3>
        <div>
          View all issues for selected GitHub community. Select issues to be
          managed by Gov4Git.
        </div>
      </Card>
      <Card
        size="small"
        className={styles.card}
        onClick={() => setCommunityManageState('pull-requests')}
      >
        <h3>Manage Pull Requests</h3>
        <div>
          View all pull requests for selected GitHub community. Select pull
          requests to be managed by Gov4Git.
        </div>
      </Card>
    </div>
  )
}
