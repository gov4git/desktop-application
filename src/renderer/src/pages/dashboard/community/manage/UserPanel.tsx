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

import { useDataStore } from '../../../../store/store.js'
import { useManageCommunityStyles } from './styles.js'

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
            {users != null &&
              users.map((u) => (
                <TableRow key={u.username}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.credits}</TableCell>
                  <TableCell>
                    <Button onClick={() => setSelectedUsername(u.username)}>
                      Issue Credits
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
