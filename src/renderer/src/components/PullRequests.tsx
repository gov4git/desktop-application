import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'

import { ballotPullRequestsAtom } from '../state/ballots.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { IssueBallot2 } from './IssueBallot2.js'

export const PullRequests: FC = function PullRequests() {
  const ballots = useAtomValue(ballotPullRequestsAtom)
  const headingStyles = useHeadingsStyles()
  if (ballots == null) return <></>
  if (ballots.length === 0)
    return (
      <>
        <h1 className={headingStyles.pageHeading}>Prioritize Pull Requests</h1>
        <Card>
          <p>No open ballots for pull requests to display at this time.</p>
        </Card>
      </>
    )

  return (
    <>
      <h1 className={headingStyles.pageHeading}>Prioritize Pull Requests</h1>
      {ballots.map((ballot) => {
        return <IssueBallot2 key={ballot.identifier} ballot={ballot} />
      })}
    </>
  )
}
