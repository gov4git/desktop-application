import { FC, PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { routes } from '../App/index.js'
import { useDataStore } from '../store/store.js'

export const RequireAuth: FC<PropsWithChildren> = function RequireAuth({
  children,
}) {
  const user = useDataStore((s) => s.userInfo.user)
  const community = useDataStore((s) => s.communityInfo.selectedCommunity)

  if (user == null || community == null || !community.isMember) {
    return <Navigate to={routes.settings.path} />
  } else {
    return children
  }
}
