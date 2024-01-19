import { useSetAtom } from 'jotai'
import { FC, useEffect, useState } from 'react'

import { Motions } from '../components/index.js'
import { useResetMotionSearchOptions } from '../hooks/motions.js'
import { motionsTypeAtom } from '../state/motions.js'

type PollsPageState = 'ISSUES' | 'PULL_REQUESTS'

export type PollsPageProps = {
  state: PollsPageState
}

export const PollsPage: FC<PollsPageProps> = function PollsPage({ state }) {
  const setMotionsType = useSetAtom(motionsTypeAtom)
  const resetMotionsSearchOptions = useResetMotionSearchOptions()
  const [title, setTitle] = useState('')

  useEffect(() => {
    console.log(`=========== STATE: ${state}`)
    switch (state) {
      case 'PULL_REQUESTS':
        setMotionsType('proposal')
        setTitle('Prioritize Pull Requests')
        break
      default:
        setMotionsType('concern')
        setTitle('Prioritize Issues')
    }
    resetMotionsSearchOptions()
  }, [state, setMotionsType, resetMotionsSearchOptions, setTitle])

  return <Motions title={title} />
}

export default PollsPage
