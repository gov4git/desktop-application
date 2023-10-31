import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import { type FC, useMemo } from 'react'

import { ballotIssuesAtom } from '../state/ballots.js'
import { configAtom } from '../state/config.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { IssueBallot } from './IssueBallot.js'
import { useIssuesStyles } from './Issues.styles.js'

export const Issues: FC = function Issues() {
  const ballots = useAtomValue(ballotIssuesAtom)
  const headingStyles = useHeadingsStyles()
  const styles = useIssuesStyles()
  const config = useAtomValue(configAtom)

  const issuesLink = useMemo(() => {
    if (config == null) return null
    return `${config.project_repo}/issues?q=is:open is:issue label:gov4git:prioritize`
  }, [config])

  return (
    <>
      <h1 className={headingStyles.pageHeading}>Prioritize Issues</h1>

      <div className={styles.controls}>
        {issuesLink != null && (
          <a href={issuesLink} target="_blank" rel="noreferrer">
            View all issues in GitHub
          </a>
        )}
      </div>

      {(ballots == null || ballots.length === 0) && (
        <Card>
          <p>No open ballots for issues to display at this time.</p>
        </Card>
      )}
      {ballots != null &&
        ballots.map((ballot) => {
          return <IssueBallot key={ballot.identifier} ballot={ballot} />
        })}
    </>
  )
}
