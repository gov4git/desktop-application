import { FC, useMemo } from 'react'

import { Issues, OtherBallots, PullRequests } from '../components/index.js'

type PollsPageState = 'ISSUES' | 'PULL_REQUESTS' | 'OTHER'

export type PollsPageProps = {
  state: PollsPageState
}

export const PollsPage: FC<PollsPageProps> = function PollsPage({ state }) {
  const Component: FC = useMemo(() => {
    switch (state) {
      case 'ISSUES':
        return Issues
      case 'PULL_REQUESTS':
        return PullRequests
      default:
        return OtherBallots
    }
  }, [state])

  return <Component />
}

export default PollsPage
