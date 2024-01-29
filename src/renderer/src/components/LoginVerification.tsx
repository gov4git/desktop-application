import type { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'
import { FC, useCallback, useEffect, useState } from 'react'

import { useFinishLoginFlow } from '../store/hooks/userHooks.js'
import { useMessageStyles } from '../styles/index.js'
import { useLoginVerificationStyle } from './LoginVerification.styles.js'
import { Message } from './Message.js'

export type LoginVerificationProps = {
  verification: Verification | null
  onLoggedIn: () => void | Promise<void>
}

export const LoginVerification: FC<LoginVerificationProps> =
  function LoginVerification({ verification, onLoggedIn }) {
    const styles = useLoginVerificationStyle()
    const messageStyles = useMessageStyles()
    const [loginErrors, setLoginErrors] = useState<string[] | null>([])
    const [internalVerification, setInternalVerification] =
      useState<Verification | null>(null)
    const finishLoginFlow = useFinishLoginFlow()

    useEffect(() => {
      setInternalVerification(verification)
    }, [verification, setInternalVerification])

    useEffect(() => {
      async function run() {
        if (internalVerification != null) {
          const errors = await finishLoginFlow()
          setLoginErrors(errors)
          setInternalVerification(null)
          if (errors == null || errors.length === 0) {
            await Promise.resolve(onLoggedIn())
          }
        }
      }
      void run()
    }, [internalVerification, finishLoginFlow, setLoginErrors, onLoggedIn])

    const dismissError = useCallback(() => {
      setLoginErrors(null)
    }, [setLoginErrors])

    return (
      <>
        {loginErrors != null && loginErrors.length > 0 && (
          <Message
            messages={loginErrors}
            onClose={dismissError}
            className={messageStyles.error}
          />
        )}
        {internalVerification != null && (
          <div className={styles.verificationArea}>
            <div>
              Login with your deviec at{' '}
              <a
                href={internalVerification.verification_uri}
                target="_blank"
                rel="noreferrer"
              >
                {internalVerification.verification_uri}
              </a>
            </div>
            <div>
              Verification code:{' '}
              <strong>{internalVerification.user_code}</strong>
            </div>
          </div>
        )}
      </>
    )
  }
