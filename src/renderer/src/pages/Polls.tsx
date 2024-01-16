import { FC, useMemo } from 'react'

import { Issues, PullRequests } from '../components/index.js'

type PollsPageState = 'ISSUES' | 'PULL_REQUESTS'

export type PollsPageProps = {
  state: PollsPageState
}

export const PollsPage: FC<PollsPageProps> = function PollsPage({ state }) {
  const Component: FC = useMemo(() => {
    switch (state) {
      case 'ISSUES':
        return Issues
      default:
        return PullRequests
    }
  }, [state])

  return <Component />
}

export default PollsPage
