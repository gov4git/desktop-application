import { Button } from '@fluentui/react-components'
import { Add32Filled, People32Filled } from '@fluentui/react-icons'
import { FC, memo, useMemo } from 'react'

import { useDataStore } from '../../../../store/store.js'
import { useCommunityOverviewStyles } from './CommunityOverview.styles.js'
import { CommunityTable } from './CommunityTable.js'
import { CommunityDeploy } from './deploy/CommunityDeploy.js'
import { JoinCommunity } from './join/JoinCommunity.js'

export const CommunityOverview: FC = function CommunityOverview() {
  const styles = useCommunityOverviewStyles()
  const communityOverviewState = useDataStore((s) => s.communityOverview.state)

  const Component: FC = useMemo(() => {
    switch (communityOverviewState) {
      case 'join':
        return JoinCommunity
      case 'deploy':
        return CommunityDeploy
      default:
        return CommunityOverviewButtons
    }
  }, [communityOverviewState])

  return (
    <div className={styles.container}>
      <CommunityTable />
      <Component />
    </div>
  )
}

export const CommunityOverviewButtons: FC = memo(
  function CommunityOverviewButtons() {
    const styles = useCommunityOverviewStyles()
    const setCommunityOverviewState = useDataStore(
      (s) => s.communityOverview.setState,
    )

    return (
      <div className={styles.buttonRow}>
        <Button
          appearance="primary"
          icon={<People32Filled />}
          onClick={() => setCommunityOverviewState('join')}
        >
          Join a Community
        </Button>
        <Button
          appearance="primary"
          icon={<Add32Filled />}
          onClick={() => setCommunityOverviewState('deploy')}
        >
          Deploy a New Community
        </Button>
      </div>
    )
  },
)
