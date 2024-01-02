import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import { type FC, useEffect, useMemo, useState } from 'react'

import { useFetchPullRequests } from '../hooks/ballots.js'
import {
  pullRequestsAtom,
  pullRequestsearchOptionsAtom,
  pullRequestsSearchAtom,
  pullRequestsSearchResultsAtom,
  pullRequestsStatusAtom,
  pullRequestsVotedOnAtom,
} from '../state/ballots.js'
import { communityAtom } from '../state/community.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { BallotControls } from './BallotControls.js'
import { IssueBallot } from './IssueBallot.js'

export const PullRequests: FC = function PullRequests() {
  const ballots = useAtomValue(pullRequestsAtom)
  const headingStyles = useHeadingsStyles()
  const community = useAtomValue(communityAtom)
  const fetchPullRequestsOptions = useAtomValue(pullRequestsearchOptionsAtom)
  const [globalSearchAtom] = useState(pullRequestsSearchAtom)
  const [globalStatusAtom] = useState(pullRequestsStatusAtom)
  const [globalVotedOnAtom] = useState(pullRequestsVotedOnAtom)
  const [globalSearchResultsAtom] = useState(pullRequestsSearchResultsAtom)
  const fetchPullRequests = useFetchPullRequests()

  useEffect(() => {
    fetchPullRequests()
  }, [fetchPullRequestsOptions, fetchPullRequests])

  const pullRequestsLink = useMemo(() => {
    if (community == null) return null
    return `${community.projectUrl}/pulls?q=is:open is:pr label:gov4git:prioritize`
  }, [community])

  return (
    <>
      <h1 className={headingStyles.pageHeading}>Prioritize Pull Requests</h1>

      <BallotControls
        searchAtom={globalSearchAtom}
        statusAtom={globalStatusAtom}
        votedOnAtom={globalVotedOnAtom}
        searchResultsAtom={globalSearchResultsAtom}
      >
        {pullRequestsLink != null && (
          <a href={pullRequestsLink} target="_blank" rel="noreferrer">
            View all pull requests in GitHub
          </a>
        )}
      </BallotControls>

      {(ballots == null || ballots.length === 0) && (
        <Card>
          <p>No matching ballots for pull requests to display at this time.</p>
        </Card>
      )}
      {ballots != null &&
        ballots.map((ballot) => {
          return <IssueBallot key={ballot.identifier} ballot={ballot} />
        })}
    </>
  )
}
