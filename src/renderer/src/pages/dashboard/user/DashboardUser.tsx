import { Button } from '@fluentui/react-components'
import { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'
import { FC, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { StyledCard } from '../../../components/index.js'
import { Loader } from '../../../components/Loader.js'
import { LoginVerification } from '../../../components/LoginVerification.js'
import { useDataStore } from '../../../store/store.js'
import { useButtonStyles } from '../../../styles/index.js'
import { useDashboardUserStyles } from './DashboardUser.styles.js'

export type LoginProps = {
  redirectOnLogin?: string
}

export const DashboardUser: FC<LoginProps> = function DashboardUser({
  redirectOnLogin = '',
}) {
  const styles = useDashboardUserStyles()
  const buttonStyles = useButtonStyles()
  const user = useDataStore((s) => s.userInfo.user)
  const navigate = useNavigate()
  const _logout = useDataStore((s) => s.userInfo.logout)
  const [verification, setVerification] = useState<Verification | null>(null)
  const startLoginFlow = useDataStore((s) => s.userInfo.startLoginFlow)
  const [waitingForVericationCode, setWaitingForVerificationCode] =
    useState(false)
  const refreshCache = useDataStore((s) => s.refreshCache)
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
  }, [setVerification, refreshCache, navigate, redirectOnLogin, setDataLoading])

  const logout = useCallback(async () => {
    void _logout()
  }, [_logout])

  return (
    <StyledCard>
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
    </StyledCard>
  )
}
