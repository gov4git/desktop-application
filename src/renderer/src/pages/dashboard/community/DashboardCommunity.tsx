import { FC, memo, useMemo } from 'react'

import { StyledCard } from '../../../components/index.js'
import { useDataStore } from '../../../store/store.js'
import { useHeadingsStyles } from '../../../styles/index.js'
import { CommunityBreadcrumbs } from './CommunityBreadcrumbs.js'
import { ManageCommunity } from './manage/ManageCommunity.js'
import { CommunityOverview } from './overview/CommunityOverview.js'

export const DashboardCommunity: FC = memo(function DashboardCommunity() {
  const headerStyles = useHeadingsStyles()
  const communityDashboardState = useDataStore(
    (s) => s.communityDashboard.state,
  )

  const Component: FC = useMemo(() => {
    switch (communityDashboardState) {
      case 'overview':
        return CommunityOverview
      case 'manage':
        return ManageCommunity
    }
  }, [communityDashboardState])

  return (
    <>
      <h2 className={headerStyles.pageHeading}>Communities</h2>
      <StyledCard>
        <CommunityBreadcrumbs />
        <Component />
      </StyledCard>
    </>
  )
})
