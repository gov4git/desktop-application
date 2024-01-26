import { useAtomValue } from 'jotai'
import { FC, PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { routes } from '../App/index.js'
import { communityAtom } from '../state/community.js'
import { userAtom, userLoadedAtom } from '../state/user.js'

export const RequireAuth: FC<PropsWithChildren> = function RequireAuth({
  children,
}) {
  const user = useAtomValue(userAtom)
  const isUserLoaded = useAtomValue(userLoadedAtom)
  const community = useAtomValue(communityAtom)

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
