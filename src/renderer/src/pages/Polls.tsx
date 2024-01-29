import { FC, useEffect, useState } from 'react'

import { Motions } from '../components/index.js'
import {
  useResetMotionsSearchArgs,
  useSetMotionsType,
} from '../store/hooks/motionHooks.js'

type PollsPageState = 'ISSUES' | 'PULL_REQUESTS'

export type PollsPageProps = {
  state: PollsPageState
}

export const PollsPage: FC<PollsPageProps> = function PollsPage({ state }) {
  const setMotionsType = useSetMotionsType()
  const resetMotionsSearchOptions = useResetMotionsSearchArgs()
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
