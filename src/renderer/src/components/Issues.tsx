import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import { type FC, useEffect } from 'react'

import { ballotIssuesAtom } from '../state/ballots.js'
import { IssueBallot2 } from './IssueBallot2.js'

export const Issues: FC = function Issues() {
  const ballots = useAtomValue(ballotIssuesAtom)

  useEffect(() => {
    console.log(ballots)
  }, [ballots])

  if (ballots == null) return <></>
  if (ballots.length === 0)
    return (
      <Card>
        <p>No open ballots to display at this time.</p>
      </Card>
    )

  return (
    <Card>
      {ballots.map((ballot) => {
        return <IssueBallot2 key={ballot.identifier} ballot={ballot} />
      })}
    </Card>
  )
}
