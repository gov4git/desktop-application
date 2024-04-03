import {
  Button,
  Dropdown,
  Field,
  Input,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { SearchBox } from '@fluentui/react-search-preview'
import {
  type FC,
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { debounceAsync } from '~/shared'

import { CommunityUser } from '../../../../../../../electron/services/CommunityService.js'
import { Loader } from '../../../../../components/Loader.js'
import { Message } from '../../../../../components/Message.js'
import { useDataStore } from '../../../../../store/store.js'
import { useMessageStyles } from '../../../../../styles/messages.js'
import { useManageCommunityStyles } from '../styles.js'

export const UserPanel: FC = memo(function UserPanel() {
  const messageStyles = useMessageStyles()
  const selectedCommunity = useDataStore(
    (s) => s.communityManage.communityToManage,
  )!
  const [selectedUsername, setSelectedUsername] = useState('')
  const [votingCredits, setVotingCredits] = useState('')
  const issueVotingCredits = useDataStore(
    (s) => s.communityManage.issueVotingCredits,
  )
  const approveUserRequest = useDataStore(
    (s) => s.communityManage.approveUserRequest,
  )
  const [loading, setLoading] = useState(false)
  const [approvingUserRequest, setApprovingUserRequest] = useState('')
  const [approveRequestMessage, setApproveRequestMessage] = useState('')
  const [approveRequestStatusOk, setApproveRequestStatusOk] = useState(true)
  const styles = useManageCommunityStyles()
  const users = useDataStore((s) => s.communityManage.users)
  const [filteredUsers, setFilteredUsers] = useState(users)
  const usersLoading = useDataStore((s) => s.communityManage.usersLoading)
  const statusOptions = ['Active', 'Denied', 'Pending']
  const [selectedOptions, setSelectedOptions] = useState([
    'Active',
    'Denied',
    'Pending',
  ])
  const [search, setSearch] = useState('')
  const [searchBox, setSearchBox] = useState('')

  const dismissResponseMessage = useCallback(() => {
    setApproveRequestMessage('')
  }, [setApproveRequestMessage])

  const approveJoinRequest = useCallback(
    async (user: CommunityUser) => {
      setApprovingUserRequest(user.username)
      const response = await approveUserRequest(selectedCommunity, user)
      setApproveRequestStatusOk(response.ok)
      if (!response.ok) {
        setApproveRequestMessage(response.error)
      } else {
        setApproveRequestMessage(response.data)
      }
      setApprovingUserRequest('')
    },
    [
      selectedCommunity,
      approveUserRequest,
      setApprovingUserRequest,
      setApproveRequestMessage,
      setApproveRequestStatusOk,
    ],
  )

  const debounceSetSearch = useMemo(() => {
    return debounceAsync(setSearch)
  }, [setSearch])

  useEffect(() => {
    debounceSetSearch(searchBox)
  }, [searchBox, debounceSetSearch])

  useEffect(() => {
    if (users !== null) {
      let filteredUsers = users.filter((u) => {
        return selectedOptions.includes(u.membershipStatus)
      })

      if (search !== '') {
        filteredUsers = filteredUsers.filter((u) => {
          return u.username.toLowerCase().includes(search.toLowerCase())
        })
      }
      setFilteredUsers(filteredUsers)
    }
  }, [search, selectedOptions, users, setFilteredUsers])

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

  const handleStatusChange = useCallback(
    (ev: any, data: any) => {
      setSelectedOptions(data.selectedOptions)
    },
    [setSelectedOptions],
  )

  return (
    <Loader isLoading={usersLoading}>
      <div className={styles.tableArea}>
        {approveRequestMessage !== '' && (
          <Message
            messages={[approveRequestMessage]}
            onClose={dismissResponseMessage}
            className={
              approveRequestStatusOk
                ? messageStyles.success
                : messageStyles.error
            }
          />
        )}

        {filteredUsers == null && (
          <>No active users or requests to join to display at this time.</>
        )}
        {filteredUsers != null && (
          <>
            <div className={styles.searchControls}>
              <div className={styles.searchBox}>
                <SearchBox
                  className={styles.searchInput}
                  size="medium"
                  placeholder="Search"
                  value={searchBox}
                  onChange={(e: any) => setSearchBox(e.target.value)}
                  dismiss={
                    // eslint-disable-next-line
                    <i
                      onClick={() => setSearchBox('')}
                      className="codicon codicon-chrome-close"
                    ></i>
                  }
                />
              </div>
              <div className={styles.controlDropdown}>
                <Dropdown
                  multiselect={true}
                  placeholder="Status"
                  selectedOptions={selectedOptions}
                  onOptionSelect={handleStatusChange}
                >
                  {statusOptions.map((option) => (
                    <Option key={option} text={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Dropdown>
              </div>
            </div>
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
                {filteredUsers.map((u) => (
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
                          <Button
                            disabled={approvingUserRequest === u.username}
                            onClick={() => approveJoinRequest(u)}
                          >
                            {approvingUserRequest === u.username && (
                              <i className="codicon codicon-loading codicon-modifier-spin" />
                            )}
                            Approve Request to Join
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
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
