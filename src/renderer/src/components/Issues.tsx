import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import { type FC, useEffect } from 'react'

import { ballotIssuesAtom } from '../state/ballots.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { IssueBallot2 } from './IssueBallot2.js'

export const Issues: FC = function Issues() {
  const ballots = useAtomValue(ballotIssuesAtom)
  const headingStyles = useHeadingsStyles()

  useEffect(() => {
    console.log(ballots)
  }, [ballots])

  if (ballots == null) return <></>
  if (ballots.length === 0)
    return (
      <>
        <h1 className={headingStyles.pageHeading}>Prioritize Issues</h1>
        <Card>
          <p>No open ballots for issues to display at this time.</p>
        </Card>
      </>
    )

  return (
    <>
      <h1 className={headingStyles.pageHeading}>Prioritize Issues</h1>
      {ballots.map((ballot) => {
        return <IssueBallot2 key={ballot.identifier} ballot={ballot} />
      })}
    </>
  )
}
