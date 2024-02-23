import { Button } from '@fluentui/react-components'
import { Add32Filled, People32Filled } from '@fluentui/react-icons'
import { FC, memo, useMemo } from 'react'

import { StyledCard } from '../../../components/index.js'
import { useDataStore } from '../../../store/store.js'
import { useHeadingsStyles } from '../../../styles/index.js'
import { CommunityTable } from './CommunityTable.js'
import { useDashboardCommunityStyle } from './DashboardCommunity.styles.js'
import { CommunityDeploy } from './deploy/CommunityDeploy.js'
import { JoinCommunity } from './join/JoinCommunity.js'
import { ManageCommunity } from './manage/ManageCommunity.js'

export const DashboardCommunity: FC = memo(function DashboardCommunity() {
  const headerStyles = useHeadingsStyles()
  const communityDashboardState = useDataStore(
    (s) => s.communityDashboard.state,
  )

  const Component: FC = useMemo(() => {
    switch (communityDashboardState) {
      case 'join':
        return JoinCommunity
      case 'deploy':
        return CommunityDeploy
      case 'manage':
        return ManageCommunity
      default:
        return DashboardCommunityButtons
    }
  }, [communityDashboardState])

  return (
    <>
      <h2 className={headerStyles.pageHeading}>Communities</h2>
      <StyledCard>
        <CommunityTable />
        <br />
        <Component />
      </StyledCard>
    </>
  )
})

export const DashboardCommunityButtons: FC = memo(
  function DashboardCommunityButtons() {
    const styles = useDashboardCommunityStyle()
    const setCommunityDashboardState = useDataStore(
      (s) => s.communityDashboard.setState,
    )

    return (
      <div className={styles.buttonRow}>
        <Button
          appearance="primary"
          icon={<People32Filled />}
          onClick={() => setCommunityDashboardState('join')}
        >
          Join a Community
        </Button>
        <Button
          appearance="primary"
          icon={<Add32Filled />}
          onClick={() => setCommunityDashboardState('deploy')}
        >
          Deploy a New Community
        </Button>
      </div>
    )
  },
)
