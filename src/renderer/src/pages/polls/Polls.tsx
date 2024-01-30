import { FC, useLayoutEffect, useState } from 'react'

import {
  useResetMotionsSearchArgs,
  useSetMotionsType,
} from '../../store/hooks/motionHooks.js'
import { Motions } from './motions/Motions.js'

type PollsPageState = 'ISSUES' | 'PULL_REQUESTS'

export type PollsPageProps = {
  state: PollsPageState
}

export const PollsPage: FC<PollsPageProps> = function PollsPage({ state }) {
  const setMotionsType = useSetMotionsType()
  const resetMotionsSearchOptions = useResetMotionsSearchArgs()
  const [title, setTitle] = useState('')

  useLayoutEffect(() => {
    resetMotionsSearchOptions()
    switch (state) {
      case 'PULL_REQUESTS':
        setMotionsType('proposal')
        setTitle('Prioritize Pull Requests')
        break
      default:
        setMotionsType('concern')
        setTitle('Prioritize Issues')
    }
  }, [state, setMotionsType, setTitle, resetMotionsSearchOptions])

  return <Motions title={title} />
}

export default PollsPage
