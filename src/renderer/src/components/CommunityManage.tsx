import {
  Button,
  Field,
  Input,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TabList,
} from '@fluentui/react-components'
import { parse } from 'marked'
import { type FC, FormEvent, memo, useCallback, useState } from 'react'

import type { IssueSearchResults } from '../../../electron/services/index.js'
import {
  useCommunityManageLoading,
  useIssueVotingCredits,
  useManagedCommunityIssues,
  useManagedCommunityUsers,
  useManageIssue,
  useSelectedCommunityToManage,
} from '../store/hooks/communityHooks.js'
import { useMessageStyles } from '../styles/messages.js'
import { useCommunityManageStyle } from './CommunityManage.styles.js'
import { Loader } from './Loader.js'
import { Message } from './Message.js'

export const CommunityManage: FC = memo(function CommunityManage() {
  const [selectedTab, setSelectedTab] = useState('users')
  const selectedCommunity = useSelectedCommunityToManage()!
  const loading = useCommunityManageLoading()

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
            {selectedTab === 'users' && <UserPanel />}
            {selectedTab === 'issues' && <IssuesPanel />}
          </Loader>
        </div>
      </div>
    </>
  )
})

const UserPanel: FC = memo(function UserPanel() {
  const selectedCommunity = useSelectedCommunityToManage()!
  const [selectedUsername, setSelectedUsername] = useState('')
  const [votingCredits, setVotingCredits] = useState('')
  const issueVotingCredits = useIssueVotingCredits()
  const [loading, setLoading] = useState(false)
  const styles = useCommunityManageStyle()
  const users = useManagedCommunityUsers()

  const issueCredits = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      setLoading(true)
      await issueVotingCredits({
        communityUrl: selectedCommunity.url,
        username: selectedUsername,
        credits: votingCredits,
      })
      setSelectedUsername('')
      setVotingCredits('0')
      setLoading(false)
    },
    [
      setLoading,
      issueVotingCredits,
      selectedUsername,
      selectedCommunity,
      votingCredits,
      setSelectedUsername,
      setVotingCredits,
    ],
  )

  return (
    <>
      <div className={styles.tableArea}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Active User</TableHeaderCell>
              <TableHeaderCell>Voting Credits</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.username}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.credits}</TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedUsername(u.username)}>
                    Assign Credits
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedUsername !== '' && (
        <form onSubmit={issueCredits} className={styles.issueCreditsForm}>
          <Field
            // @ts-expect-error children signature
            label={{
              children: () => (
                <label htmlFor="voting-credits">
                  Issue additional credits to {selectedUsername}
                </label>
              ),
            }}
          >
            <Input
              type="number"
              min={0}
              id="voting-credits"
              onChange={(e) => setVotingCredits(e.target.value)}
              disabled={loading}
            />
          </Field>
          <div className={styles.buttonRow}>
            <Button disabled={loading} onClick={() => setSelectedUsername('')}>
              Cancel
            </Button>
            <Button appearance="primary" type="submit" disabled={loading}>
              {!loading && 'Issue Additional Credits'}
              {loading && (
                <i className="codicon codicon-loading codicon-modifier-spin" />
              )}
            </Button>
          </div>
        </form>
      )}
    </>
  )
})

const isManaged = (issue: IssueSearchResults): boolean => {
  const foundIndex = issue.labels.findIndex((i) => i.name === 'gov4git:managed')
  return foundIndex !== -1
}

const IssuesPanel: FC = memo(function IssuesPanel() {
  const styles = useCommunityManageStyle()
  const messageStyles = useMessageStyles()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const selectedCommunity = useSelectedCommunityToManage()!
  const [selectedIssue, setSelectedIssue] = useState<IssueSearchResults | null>(
    null,
  )
  const manageIssue = useManageIssue()
  const issues = useManagedCommunityIssues()

  const onSelect = useCallback(
    (issue: IssueSearchResults) => {
      setSelectedIssue(issue)
    },
    [setSelectedIssue],
  )

  const manage = useCallback(async () => {
    if (selectedIssue != null) {
      setLoading(true)
      await manageIssue({
        communityUrl: selectedCommunity.url,
        issueNumber: selectedIssue.number,
      })
      setSuccessMessage(
        [
          `Success. Issue #${selectedIssue.number}, ${selectedIssue.title}, is now marked to be managed by Gov4Git.`,
          'It may take take a few hours before the system creates a ballot for the issue.',
        ].join(' '),
      )
      setLoading(false)
    }
  }, [manageIssue, setLoading, selectedCommunity, selectedIssue])

  const dismissMessage = useCallback(() => {
    setSuccessMessage('')
  }, [setSuccessMessage])

  return (
    <div>
      <div className={styles.tableArea}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Managed</TableHeaderCell>
              <TableHeaderCell>Issue</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((i) => (
              <TableRow
                key={i.id}
                onClick={() => onSelect(i)}
                className={
                  selectedIssue != null && selectedIssue.id === i.id
                    ? styles.selectedRow
                    : ''
                }
              >
                <TableCell>
                  <span
                    style={{
                      color: 'var(--colorBrandBackground)',
                      fontSize: '1.2rem',
                    }}
                  >
                    {isManaged(i) && <i className="codicon codicon-check" />}
                  </span>
                </TableCell>
                <TableCell>{i.title}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedIssue != null && (
        <div className={styles.selectedIssueArea}>
          <hgroup className={styles.titleArea}>
            <h2>{selectedIssue.title}</h2>
            <a href={selectedIssue.html_url} target="_blank" rel="noreferrer">
              {selectedIssue.html_url}
            </a>
          </hgroup>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: parse(selectedIssue.body ?? ''),
            }}
          ></div>
          <div>
            {!isManaged(selectedIssue) && (
              <Button onClick={manage} appearance="primary">
                {!loading && <>Manage with Gov4Git</>}
                {loading && (
                  <i className="codicon codicon-loading codicon-modifier-spin" />
                )}
              </Button>
            )}
            {isManaged(selectedIssue) && <strong>Managed with Gov4Git</strong>}
          </div>
          {successMessage !== '' && (
            <Message
              className={messageStyles.success}
              messages={[successMessage]}
              onClose={dismissMessage}
            />
          )}
        </div>
      )}
    </div>
  )
})
