import { Alert } from '@fluentui/react-components/unstable'
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
  } else if (user == null) {
    return <Navigate to={routes.login.path} />
  } else if (community == null || !community.isMember) {
    return <Navigate to={routes.communityJoin.path} />
  } else {
    return children
  }
}

// const Unauthorized: FC = function Unauthorized() {
//   const community = useAtomValue(communityAtom)
//   const user = useAtomValue(userAtom) as User

//   return (
//     <Alert intent="error">
//       Unauthorized {user?.username} is not a member of {community?.url}. &nbsp;
//       <a
//         href={
//           community?.projectUrl +
//           '/issues/new?template=join.yml&contributor_public_url=' +
//           user?.memberPublicUrl +
//           '&contributor_public_branch=' +
//           user?.memberPublicBranch +
//           "&title=I'd like to join this project's community" +
//           '&labels=gov4git:join'
//         }
//         target="_blank"
//         rel="noreferrer"
//       >
//         Request access here
//       </a>
//       .
//     </Alert>
//   )
// }
