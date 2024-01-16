import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import { type FC, useEffect, useMemo, useState } from 'react'

import { useFetchPullRequests } from '../hooks/motions.js'
import { eventBus } from '../lib/index.js'
import { communityAtom } from '../state/community.js'
import {
  proposalsAtom,
  proposalsSearchAtom,
  proposalsSearchOptionsAtom,
  proposalsSearchResultsAtom,
  proposalsStatusAtom,
  proposalsVotedOnAtom,
} from '../state/motions.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { BallotControls } from './BallotControls.js'
import { IssueBallot } from './IssueBallot.js'
import { Loader } from './Loader.js'

export const PullRequests: FC = function PullRequests() {
  const ballots = useAtomValue(proposalsAtom)
  const headingStyles = useHeadingsStyles()
  const community = useAtomValue(communityAtom)
  const fetchPullRequestsOptions = useAtomValue(proposalsSearchOptionsAtom)
  const [globalSearchAtom] = useState(proposalsSearchAtom)
  const [globalStatusAtom] = useState(proposalsStatusAtom)
  const [globalVotedOnAtom] = useState(proposalsVotedOnAtom)
  const [globalSearchResultsAtom] = useState(proposalsSearchResultsAtom)
  const fetchPullRequests = useFetchPullRequests()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function run() {
      setLoading(true)
      await fetchPullRequests()
      setLoading(false)
    }
    void run()
  }, [fetchPullRequestsOptions, fetchPullRequests])

  useEffect(() => {
    return eventBus.subscribe('cache-refreshed', () => {
      fetchPullRequests()
    })
  }, [fetchPullRequests])

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

      <Loader isLoading={loading}>
        {(ballots == null || ballots.length === 0) && (
          <Card>
            <p>
              No matching ballots for pull requests to display at this time.
            </p>
          </Card>
        )}
        {ballots != null &&
          ballots.map((motion) => {
            return <IssueBallot key={motion.motionId} motion={motion} />
          })}
      </Loader>
    </>
  )
}
