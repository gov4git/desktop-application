import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
} from '@fluentui/react-components'
import { FC, memo, useMemo } from 'react'

import { useDataStore } from '../../../store/store.js'

export const CommunityBreadcrumbs: FC = memo(function CommunityBreadcrumbs() {
  const state = useDataStore((s) => s.communityDashboard.state)
  const setCommunityDashboardState = useDataStore(
    (s) => s.communityDashboard.setState,
  )
  const setCommunityManageState = useDataStore(
    (s) => s.communityManage.setState,
  )
  const communityManageState = useDataStore((s) => s.communityManage.state)
  const communityToManage = useDataStore(
    (s) => s.communityManage.communityToManage,
  )

  const communityManageMessage = useMemo(() => {
    switch (communityManageState) {
      case 'users':
        return 'Users'
      case 'issues':
        return 'Issues'
      case 'pull-requests':
        return 'Pull Requests'
      default:
        return ''
    }
  }, [communityManageState])

  if (state == 'overview') {
    return <></>
  }

  return (
    <Breadcrumb size="large">
      <BreadcrumbItem>
        <BreadcrumbButton
          onClick={() => {
            setCommunityDashboardState('overview')
            setCommunityManageState('overview')
          }}
        >
          Communities
        </BreadcrumbButton>
      </BreadcrumbItem>
      <BreadcrumbDivider />
      <BreadcrumbItem>
        <BreadcrumbButton onClick={() => setCommunityManageState('overview')}>
          Manage {communityToManage?.name}
        </BreadcrumbButton>
      </BreadcrumbItem>
      {communityManageMessage !== '' && (
        <>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton>{communityManageMessage}</BreadcrumbButton>
          </BreadcrumbItem>
        </>
      )}
    </Breadcrumb>
  )
})
