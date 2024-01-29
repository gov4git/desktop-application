import { FC, PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { routes } from '../App/index.js'
import { useCommunity } from '../store/hooks/communityHooks.js'
import { useUser, useUserLoaded } from '../store/hooks/userHooks.js'

export const RequireAuth: FC<PropsWithChildren> = function RequireAuth({
  children,
}) {
  const user = useUser()
  const isUserLoaded = useUserLoaded()
  const community = useCommunity()

  if (!isUserLoaded) {
    return <></>
  } else if (user == null || community == null || !community.isMember) {
    return <Navigate to={routes.settings.path} />
    // } else if (community == null || !community.isMember) {
    //   return <Navigate to={routes.communityJoin.path} />
  } else {
    return children
  }
}
