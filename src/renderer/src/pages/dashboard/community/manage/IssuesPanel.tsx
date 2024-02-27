import {
  Button,
  Dropdown,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { parse } from 'marked'
import { type FC, memo, useCallback, useState } from 'react'

import { Policy } from '../../../../../../electron/db/schema.js'
import type { CommunityIssue } from '../../../../../../electron/services/index.js'
import { Message } from '../../../../components/Message.js'
import { useDataStore } from '../../../../store/store.js'
import { useMessageStyles } from '../../../../styles/messages.js'
import { useManageCommunityStyles } from './styles.js'

const isManaged = (issue: CommunityIssue): boolean => {
  return issue.policy != null
}

export const IssuesPanel: FC = memo(function IssuesPanel() {
  const styles = useManageCommunityStyles()
  const messageStyles = useMessageStyles()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const selectedCommunity = useDataStore(
    (s) => s.communityManage.communityToManage,
  )!
  const [selectedIssue, setSelectedIssue] = useState<CommunityIssue | null>(
    null,
  )
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const manageIssue = useDataStore((s) => s.communityManage.manageIssue)
  const issues = useDataStore((s) => s.communityManage.issues)

  const selectPolicy = useCallback(
    (policy: Policy) => {
      console.log('POLICY')
      console.log(policy)
      setSelectedPolicy(policy)
    },
    [setSelectedPolicy],
  )

  const onSelect = useCallback(
    (issue: CommunityIssue) => {
      setSelectedIssue(issue)
    },
    [setSelectedIssue],
  )

  const manage = useCallback(async () => {
    if (selectedIssue != null && selectedPolicy != null) {
      setLoading(true)
      await manageIssue({
        communityUrl: selectedCommunity.url,
        issueNumber: selectedIssue.number,
        label: selectedPolicy.githubLabel,
      })
      setSuccessMessage(
        [
          `Success. Issue #${selectedIssue.number}, ${selectedIssue.title}, is now marked to be managed by Gov4Git.`,
          'It may take take a few hours before the system creates a ballot for the issue.',
        ].join(' '),
      )
      setLoading(false)
    }
  }, [
    manageIssue,
    setLoading,
    selectedCommunity,
    selectedIssue,
    selectedPolicy,
  ])

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
            {issues != null &&
              issues.issues.map((i) => (
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
              <>
                <Dropdown placeholder="Select a policy">
                  {issues?.policies.map((p) => (
                    <Option
                      key={p.title}
                      value={p.title}
                      onClick={() => selectPolicy(p)}
                    >
                      {p.title}
                    </Option>
                  ))}
                </Dropdown>
                <Button
                  disabled={loading || selectedPolicy == null}
                  onClick={manage}
                  appearance="primary"
                >
                  {!loading && <>Manage with Gov4Git</>}
                  {loading && (
                    <i className="codicon codicon-loading codicon-modifier-spin" />
                  )}
                </Button>
              </>
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
