import { Card } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { type FC, useEffect, useMemo, useState } from 'react'

import { useFetchIssues } from '../hooks/ballots.js'
import {
  issuesAtom,
  issueSearchAtom,
  issueSearchOptionsAtom,
  issuesSearchResultsAtom,
  issuesStatusAtom,
  issuesVotedOnAtom,
} from '../state/ballots.js'
import { communityAtom } from '../state/community.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { BallotControls } from './BallotControls.js'
import { IssueBallot } from './IssueBallot.js'

export const Issues: FC = function Issues() {
  const issues = useAtomValue(issuesAtom)
  const headingStyles = useHeadingsStyles()
  const community = useAtomValue(communityAtom)
  const fetchIssues = useFetchIssues()
  const fetchIssuesOptions = useAtomValue(issueSearchOptionsAtom)
  const [globalSearchAtom] = useState(issueSearchAtom)
  const [globalIssuesStatusAtom] = useState(issuesStatusAtom)
  const [globalVotedOnAtom] = useState(issuesVotedOnAtom)
  const [globalSearchResultsAtom] = useState(issuesSearchResultsAtom)

  useEffect(() => {
    fetchIssues()
  }, [fetchIssuesOptions, fetchIssues])

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

      {(issues == null || issues.length === 0) && (
        <Card>
          <p>No matching ballots for issues to display at this time.</p>
        </Card>
      )}
      {issues != null &&
        issues.map((ballot) => {
          return <IssueBallot key={ballot.identifier} ballot={ballot} />
        })}
    </>
  )
}
