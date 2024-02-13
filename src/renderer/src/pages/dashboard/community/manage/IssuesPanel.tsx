import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { parse } from 'marked'
import { type FC, memo, useCallback, useState } from 'react'

import type { IssueSearchResults } from '../../../../../../electron/services/index.js'
import { Message } from '../../../../components/Message.js'
import { useDataStore } from '../../../../store/store.js'
import { useMessageStyles } from '../../../../styles/messages.js'
import { useManageCommunityStyles } from './styles.js'

const isManaged = (issue: IssueSearchResults): boolean => {
  const foundIndex = issue.labels.findIndex((i) => i.name === 'gov4git:pmp-v1')
  return foundIndex !== -1
}

export const IssuesPanel: FC = memo(function IssuesPanel() {
  const styles = useManageCommunityStyles()
  const messageStyles = useMessageStyles()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const selectedCommunity = useDataStore(
    (s) => s.communityManage.communityToManage,
  )!
  const [selectedIssue, setSelectedIssue] = useState<IssueSearchResults | null>(
    null,
  )
  const manageIssue = useDataStore((s) => s.communityManage.manageIssue)
  const issues = useDataStore((s) => s.communityManage.issues)

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
            {issues != null &&
              issues.map((i) => (
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
