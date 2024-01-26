import { Button } from '@fluentui/react-components'
import { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'
import { useAtomValue } from 'jotai'
import { FC, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useRefreshCache } from '../hooks/cache.js'
import { useLogout, useStartLoginFlow } from '../hooks/users.js'
import { userAtom } from '../state/user.js'
import { useButtonStyles } from '../styles/index.js'
import { Loader } from './Loader.js'
import { useLoginStyles } from './Login.styles.js'
import { LoginVerification } from './LoginVerification.js'

export type LoginProps = {
  redirectOnLogin?: string
}

export const Login: FC<LoginProps> = function Login({ redirectOnLogin = '' }) {
  const styles = useLoginStyles()
  const buttonStyles = useButtonStyles()
  const user = useAtomValue(userAtom)
  const navigate = useNavigate()
  const _logout = useLogout()
  const [verification, setVerification] = useState<Verification | null>(null)
  const startLoginFlow = useStartLoginFlow()
  const [waitingForVericationCode, setWaitingForVerificationCode] =
    useState(false)
  const refreshCache = useRefreshCache()
  const [dataLoading, setDataLoading] = useState(false)

  const login = useCallback(async () => {
    setWaitingForVerificationCode(true)
    const verification = await startLoginFlow()
    setVerification(verification)
    setWaitingForVerificationCode(false)
  }, [startLoginFlow, setWaitingForVerificationCode, setVerification])

  const onLoggedIn = useCallback(async () => {
    setVerification(null)
    setDataLoading(true)
    await refreshCache()
    setDataLoading(false)
    if (redirectOnLogin !== '') {
      navigate(redirectOnLogin)
    }
  }, [setVerification, refreshCache, setDataLoading, navigate, redirectOnLogin])

  const logout = useCallback(async () => {
    void _logout()
  }, [_logout])

  return (
    <div>
      {verification == null && (
        <Loader isLoading={dataLoading}>
          <div>
            {user != null && (
              <div className={styles.logoutArea}>
                Logged in as <strong>{user.username}</strong>
              </div>
            )}
            <div className={styles.buttons}>
              {user != null && (
                <Button shape="circular" onClick={logout}>
                  Log Out
                </Button>
              )}
              <Button
                onClick={login}
                shape="circular"
                className={buttonStyles.primary}
                disabled={waitingForVericationCode}
              >
                {waitingForVericationCode && (
                  <i className="codicon codicon-loading codicon-modifier-spin" />
                )}
                {!waitingForVericationCode && user != null && (
                  <>
                    <i className="codicon codicon-github" /> &nbsp;Reauthorize
                  </>
                )}
                {!waitingForVericationCode && user == null && (
                  <>
                    <i className="codicon codicon-github" />
                    &nbsp;Login with GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        </Loader>
      )}
      <LoginVerification verification={verification} onLoggedIn={onLoggedIn} />
    </div>
  )
}
