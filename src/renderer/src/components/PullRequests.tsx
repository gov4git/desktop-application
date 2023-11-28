import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import { type FC, useMemo } from 'react'

import { ballotPullRequestsAtom } from '../state/ballots.js'
import { communityAtom } from '../state/community.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { IssueBallot } from './IssueBallot.js'
import { usePullRequestsStyles } from './PullRequests.styles.js'

export const PullRequests: FC = function PullRequests() {
  const ballots = useAtomValue(ballotPullRequestsAtom)
  const headingStyles = useHeadingsStyles()
  const community = useAtomValue(communityAtom)
  const styles = usePullRequestsStyles()
  const issuesLink = useMemo(() => {
    if (community == null) return null
    return `${community.projectUrl}/pulls?q=is:open is:pr label:gov4git:prioritize`
  }, [community])

  return (
    <>
      <h1 className={headingStyles.pageHeading}>Prioritize Pull Requests</h1>

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
          return <IssueBallot key={ballot.identifier} ballot={ballot} />
        })}
    </>
  )
}
