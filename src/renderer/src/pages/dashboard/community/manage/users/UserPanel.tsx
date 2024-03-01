import {
  Button,
  Field,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { type FC, FormEvent, memo, useCallback, useState } from 'react'

import { Loader } from '../../../../../components/Loader.js'
import { useDataStore } from '../../../../../store/store.js'
import { useManageCommunityStyles } from '../styles.js'

export const UserPanel: FC = memo(function UserPanel() {
  const selectedCommunity = useDataStore(
    (s) => s.communityManage.communityToManage,
  )!
  const [selectedUsername, setSelectedUsername] = useState('')
  const [votingCredits, setVotingCredits] = useState('')
  const issueVotingCredits = useDataStore(
    (s) => s.communityManage.issueVotingCredits,
  )
  const [loading, setLoading] = useState(false)
  const styles = useManageCommunityStyles()
  const users = useDataStore((s) => s.communityManage.users)
  const usersLoading = useDataStore((s) => s.communityManage.usersLoading)

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
    <Loader isLoading={usersLoading}>
      <div className={styles.tableArea}>
        {users == null && (
          <>No active users or requests to join to display at this time.</>
        )}
        {users != null && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Membership Status</TableHeaderCell>
                <TableHeaderCell>Voting Credits</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.username}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>
                    {u.requestUrl != null && (
                      <a href={u.requestUrl} target="_blank" rel="noreferrer">
                        {u.membershipStatus}
                      </a>
                    )}
                    {u.requestUrl == null && <>{u.membershipStatus}</>}
                  </TableCell>
                  <TableCell>
                    {u.votingCredits == null ? 'NA' : u.votingCredits}
                  </TableCell>
                  <TableCell>
                    {u.membershipStatus === 'Active' && (
                      <Button onClick={() => setSelectedUsername(u.username)}>
                        Issue Credits
                      </Button>
                    )}
                    {u.membershipStatus === 'Pending' &&
                      u.issueNumber != null && (
                        <Button>Approve Request to Join</Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
    </Loader>
  )
})
