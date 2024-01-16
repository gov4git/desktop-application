import { Card } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { type FC, useEffect, useMemo, useState } from 'react'

import { useFetchIssues } from '../hooks/motions.js'
import { eventBus } from '../lib/index.js'
import { communityAtom } from '../state/community.js'
import {
  concernsAtom,
  concernSeachOptionsAtom,
  concernSearchResultsAtom,
  concernsSearchAtom,
  concernsStatusAtom,
  concernsVotedOnAtom,
} from '../state/motions.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { BallotControls } from './BallotControls.js'
import { IssueBallot } from './IssueBallot.js'
import { Loader } from './Loader.js'

export const Issues: FC = function Issues() {
  const issues = useAtomValue(concernsAtom)
  const headingStyles = useHeadingsStyles()
  const community = useAtomValue(communityAtom)
  const fetchIssues = useFetchIssues()
  const fetchIssuesOptions = useAtomValue(concernSeachOptionsAtom)
  const [globalSearchAtom] = useState(concernsSearchAtom)
  const [globalIssuesStatusAtom] = useState(concernsStatusAtom)
  const [globalVotedOnAtom] = useState(concernsVotedOnAtom)
  const [globalSearchResultsAtom] = useState(concernSearchResultsAtom)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function run() {
      setLoading(true)
      await fetchIssues()
      setLoading(false)
    }
    void run()
  }, [fetchIssuesOptions, fetchIssues])

  useEffect(() => {
    return eventBus.subscribe('cache-refreshed', () => {
      fetchIssues()
    })
  }, [fetchIssues])

  const issuesLink = useMemo(() => {
    if (community == null) return null
    return `${community.projectUrl}/issues?q=is:open is:issue label:gov4git:prioritize`
  }, [community])

  return (
    <>
      <h1 className={headingStyles.pageHeading}>Prioritize Issues</h1>

      <BallotControls
        searchAtom={globalSearchAtom}
        statusAtom={globalIssuesStatusAtom}
        votedOnAtom={globalVotedOnAtom}
        searchResultsAtom={globalSearchResultsAtom}
      >
        {issuesLink != null && (
          <a href={issuesLink} target="_blank" rel="noreferrer">
            View all issues in GitHub
          </a>
        )}
      </BallotControls>

      <Loader isLoading={loading}>
        {(issues == null || issues.length === 0) && (
          <Card>
            <p>No matching ballots for issues to display at this time.</p>
          </Card>
        )}
        {issues != null &&
          issues.map((motion) => {
            return <IssueBallot key={motion.motionId} motion={motion} />
          })}
      </Loader>
    </>
  )
}
