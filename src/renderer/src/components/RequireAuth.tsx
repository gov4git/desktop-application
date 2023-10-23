import { Alert } from '@fluentui/react-components/unstable'
import { useAtomValue } from 'jotai'
import { FC, PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import type { User } from '~/shared'

import { routes } from '../App/index.js'
import { configAtom } from '../state/config.js'
import { userAtom, userLoadedAtom } from '../state/user.js'

export const RequireAuth: FC<PropsWithChildren> = function RequireAuth({
  children,
}) {
  const user = useAtomValue(userAtom)
  const isUserLoaded = useAtomValue(userLoadedAtom)

  if (!isUserLoaded) {
    return <></>
  } else if (user == null) {
    return <Navigate to={routes.login.path} />
  } else if (!user.is_member) {
    return <Unauthorized />
  } else {
    return children
  }
}

const Unauthorized: FC = function Unauthorized() {
  const config = useAtomValue(configAtom)
  const user = useAtomValue(userAtom) as User

  return (
    <Alert intent="error">
      Unauthorized {user?.username} is not a member of {config?.project_repo}.
      &nbsp;
      <a
        href={
          config?.project_repo +
          '/issues/new?template=join.yml&contributor_public_url=' +
          config?.member_public_url +
          '&contributor_public_branch=' +
          config?.member_public_branch +
          "&title=I'd like to join this project's community" +
          '&labels=gov4git:join'
        }
        target="_blank"
        rel="noreferrer"
      >
        Request access here
      </a>
      .
    </Alert>
  )
}
