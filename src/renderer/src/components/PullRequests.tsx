import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import { type FC, useMemo } from 'react'

import { ballotPullRequestsAtom } from '../state/ballots.js'
import { configAtom } from '../state/config.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { IssueBallot2 } from './IssueBallot2.js'
import { usePullRequestsStyles } from './PullRequests.styles.js'

export const PullRequests: FC = function PullRequests() {
  const ballots = useAtomValue(ballotPullRequestsAtom)
  const headingStyles = useHeadingsStyles()
  const config = useAtomValue(configAtom)
  const styles = usePullRequestsStyles()
  const issuesLink = useMemo(() => {
    if (config == null) return null
    return `${config.project_repo}/pulls?q=is:open is:pr label:gov4git:prioritize`
  }, [config])

  return (
    <>
      <h1 className={headingStyles.pageHeading}>Prioritize Issues</h1>

      <div className={styles.controls}>
        {issuesLink != null && (
          <a href={issuesLink} target="_blank" rel="noreferrer">
            View all pull requests in GitHub
          </a>
        )}
      </div>

      {(ballots == null || ballots.length === 0) && (
        <Card>
          <p>No open ballots for pull requests to display at this time.</p>
        </Card>
      )}
      {ballots != null &&
        ballots.map((ballot) => {
          return <IssueBallot2 key={ballot.identifier} ballot={ballot} />
        })}
    </>
  )
}
