import { Button } from '@fluentui/react-components'
import { useAtom, useAtomValue } from 'jotai'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLogin, useLogout } from '../hooks/users.js'
import {
  userAtom,
  userLoginErrorsAtom,
  userVerificationAtom,
} from '../state/user.js'
import { useButtonStyles, useMessageStyles } from '../styles/index.js'
import { useLoginStyles2 } from './Login.styles.js'
import { Message } from './Message.js'

export type LoginProps = {
  redirectOnLogin?: string
}

export const Login: FC<LoginProps> = function Login({ redirectOnLogin = '' }) {
  const styles = useLoginStyles2()
  const buttonStyles = useButtonStyles()
  const user = useAtomValue(userAtom)
  const messageStyles = useMessageStyles()
  const navigate = useNavigate()
  const _login = useLogin()
  const _logout = useLogout()
  const [userLoginErrors, setUserLoginErrors] = useAtom(userLoginErrorsAtom)
  const [userVerification, setUserVerification] = useAtom(userVerificationAtom)

  useEffect(() => {
    if (redirectOnLogin !== '' && user != null) {
      setUserVerification(null)
      navigate(redirectOnLogin)
    }
  }, [user, setUserVerification, navigate, redirectOnLogin])

  const showVerification = useMemo(() => {
    return userVerification != null
  }, [userVerification])

  const dismissError = useCallback(() => {
    setUserLoginErrors(null)
  }, [setUserLoginErrors])

  const login = useCallback(async () => {
    void _login()
  }, [_login])

  const logout = useCallback(async () => {
    void _logout()
  }, [_logout])

  return (
    <>
      {userLoginErrors != null && userLoginErrors.length > 0 && (
        <Message
          messages={userLoginErrors}
          onClose={dismissError}
          className={messageStyles.error}
        />
      )}

      {user != null && (
        <div>
          <div className={styles.logoutArea}>
            Logged in as <strong>{user.username}</strong>
          </div>
          <div>
            <Button shape="circular" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      )}

      {user == null && (
        <div>
          {!showVerification && (
            <div className={styles.buttons}>
              <Button
                shape="circular"
                onClick={login}
                className={buttonStyles.primary}
              >
                <i className="codicon codicon-github" />
                &nbsp;Login with GitHub
              </Button>
            </div>
          )}

          {showVerification && (
            <div className={styles.verificationArea}>
              Login with your deviec at{' '}
              <a
                href={userVerification?.verification_uri}
                target="_blank"
                rel="noreferrer"
              >
                {userVerification?.verification_uri}
              </a>
              <br />
              <br />
              Verification code: <strong>{userVerification?.user_code}</strong>
            </div>
          )}
        </div>
      )}
    </>
  )
}
