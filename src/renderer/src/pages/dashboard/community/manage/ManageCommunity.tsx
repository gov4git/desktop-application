import { Tab, TabList } from '@fluentui/react-components'
import { type FC, memo, useMemo, useState } from 'react'

import { Loader } from '../../../../components/Loader.js'
import { useDataStore } from '../../../../store/store.js'
import { IssuesPanel } from './IssuesPanel.js'
import { UserPanel } from './UserPanel.js'

export const ManageCommunity: FC = memo(function ManageCommunity() {
  const [selectedTab, setSelectedTab] = useState('users')
  const selectedCommunity = useDataStore(
    (s) => s.communityManage.communityToManage,
  )!
  const managedUsers = useDataStore((s) => s.communityManage.users)
  const managedIssues = useDataStore((s) => s.communityManage.issues)
  const loading = useMemo(() => {
    return managedUsers == null || managedIssues == null
  }, [managedUsers, managedIssues])

  const Component: FC = useMemo(() => {
    if (selectedTab === 'issues') {
      return IssuesPanel
    }

    return UserPanel
  }, [selectedTab])

  return (
    <>
      <h2>Manage {selectedCommunity.name}</h2>
      <div>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(e, d) => setSelectedTab(d.value as string)}
        >
          <Tab id="users" value="users">
            Users
          </Tab>
          <Tab id="issues" value="issues">
            Issues
          </Tab>
          <Tab id="pull-requests" value="pull-requests">
            Pull Requests
          </Tab>
        </TabList>
        <div>
          <Loader isLoading={loading}>
            <Component />
          </Loader>
        </div>
      </div>
    </>
  )
})
