import { Card } from '@fluentui/react-card'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'

import { ballotsOthersAtom } from '../state/ballots.js'
import { IssueBallot } from './IssueBallot.js'

export const OtherBallots: FC = function OtherBallots() {
  const ballots = useAtomValue(ballotsOthersAtom)

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
        return <IssueBallot key={ballot.identifier} ballot={ballot} />
      })}
    </Card>
  )
}
