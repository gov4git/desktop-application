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
import { atom, useAtom, useAtomValue } from 'jotai'
import { parse } from 'marked'
import { type FC, FormEvent, useCallback, useEffect, useState } from 'react'

import type {
  IssueSearchResults,
  UserCredits,
} from '../../../electron/services/index.js'
import {
  useFetchCommunityIssues,
  useFetchCommunityUsers,
  useIssueVotingCredits,
  useManageIssue,
} from '../hooks/communities.js'
import { eventBus } from '../lib/eventBus.js'
import { communityManagedAtom } from '../state/community.js'
import { useMessageStyles } from '../styles/messages.js'
import { useCommunityManageStyle } from './CommunityManage.styles.js'
import { Loader } from './Loader.js'
import { Message } from './Message.js'

const selectedIssueAtom = atom<IssueSearchResults | null>(null)

export const CommunityManage: FC = function CommunityManage() {
  const [selectedTab, setSelectedTab] = useState('users')
  const selectedCommunity = useAtomValue(communityManagedAtom)!
  const getCommunityUsers = useFetchCommunityUsers()
  const [usersLoading, setUsersLoading] = useState(false)
  const [users, setUsers] = useState<UserCredits[]>([])
  const getCommunityIssues = useFetchCommunityIssues()
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [issues, setIssues] = useState<IssueSearchResults[]>([])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    const users = await getCommunityUsers(selectedCommunity.url)
    setUsers(users)
    setUsersLoading(false)
  }, [selectedCommunity, setUsers, getCommunityUsers, setUsersLoading])

  const loadIssues = useCallback(async () => {
    setIssuesLoading(true)
    const issues = await getCommunityIssues(selectedCommunity.url)
    console.log(issues)
    setIssues(issues)
    setIssuesLoading(false)
  }, [selectedCommunity, setIssuesLoading, setIssues, getCommunityIssues])

  useEffect(() => {
    void loadUsers()
    void loadIssues()
    return eventBus.subscribe('managed-issue', async () => {
      await loadIssues()
    })
  }, [loadUsers, loadIssues])

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
          {selectedTab === 'users' && (
            <Loader isLoading={usersLoading}>
              <UserPanel users={users} onIssuedCredits={loadUsers} />
            </Loader>
          )}
          {selectedTab === 'issues' && (
            <Loader isLoading={issuesLoading}>
              <IssuesPanel issues={issues} />
            </Loader>
          )}
        </div>
      </div>
    </>
  )
}

type UsersPanelProps = {
  users: UserCredits[]
  onIssuedCredits: () => void | Promise<void>
}

const UserPanel: FC<UsersPanelProps> = function UserPanel({
  users,
  onIssuedCredits,
}) {
  const selectedCommunity = useAtomValue(communityManagedAtom)!
  const [selectedUsername, setSelectedUsername] = useState('')
  const [votingCredits, setVotingCredits] = useState('')
  const issueVotingCredits = useIssueVotingCredits()
  const [loading, setLoading] = useState(false)
  const styles = useCommunityManageStyle()

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
      await onIssuedCredits()
    },
    [
      setLoading,
      issueVotingCredits,
      selectedUsername,
      selectedCommunity,
      votingCredits,
      setSelectedUsername,
      setVotingCredits,
      onIssuedCredits,
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
}

type IssuesPanelProps = {
  issues: IssueSearchResults[]
}

const isManaged = (issue: IssueSearchResults): boolean => {
  const foundIndex = issue.labels.findIndex((i) => i.name === 'gov4git:managed')
  return foundIndex !== -1
}

const IssuesPanel: FC<IssuesPanelProps> = function IssuesPanel({ issues }) {
  const styles = useCommunityManageStyle()
  const messageStyles = useMessageStyles()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const selectedCommunity = useAtomValue(communityManagedAtom)!
  const [selectedIssue, setSelectedIssue] = useAtom(selectedIssueAtom)
  const manageIssue = useManageIssue()

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
    eventBus.emit('managed-issue')
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
}
