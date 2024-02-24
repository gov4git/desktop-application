import { FC, useEffect, useState } from 'react'

import { useDataStore } from '../../store/store.js'
import { Motions } from './motions/Motions.js'

type PollsPageState = 'ISSUES' | 'PULL_REQUESTS'

export type PollsPageProps = {
  state: PollsPageState
}

export const PollsPage: FC<PollsPageProps> = function PollsPage({ state }) {
  const setMotionsType = useDataStore((s) => s.motionInfo.setType)
  const motionType = useDataStore((s) => s.motionInfo.searchArgs.type)
  const resetMotionsSearchOptions = useDataStore(
    (s) => s.motionInfo.resetSearchArgs,
  )
  const [title, setTitle] = useState('')

  useEffect(() => {
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

  return <Motions title={title} motionType={motionType} />
}

export default PollsPage
