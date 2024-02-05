import { FC, PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { routes } from '../App/index.js'
import { useDataStore } from '../store/store.js'

export const RequireAuth: FC<PropsWithChildren> = function RequireAuth({
  children,
}) {
  const user = useDataStore((s) => s.userInfo.user)
  const userLoaded = useDataStore((s) => s.userInfo.userLoaded)
  const community = useDataStore((s) => s.communityInfo.selectedCommunity)
  const communitiesLoaded = useDataStore(
    (s) => s.communityInfo.communitiesLoaded,
  )

  if (!userLoaded || !communitiesLoaded) {
    return <></>
  } else if (user == null || community == null || !community.isMember) {
    return <Navigate to={routes.settings.path} />
  } else {
    return children
  }
}
