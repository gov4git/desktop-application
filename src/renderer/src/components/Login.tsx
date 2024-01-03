import { Button, Card, Field, Input } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { FC, FormEvent, useCallback, useMemo, useState } from 'react'

import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/index.js'
import { userService } from '../services/UserService.js'
import { userAtom } from '../state/user.js'
import { useButtonStyles, useMessageStyles } from '../styles/index.js'
import { useLoginStyles } from './Login.styles.js'
import { Message } from './Message.js'

export const Login: FC = function Login() {
  const styles = useLoginStyles()
  const buttonStyles = useButtonStyles()
  const catchError = useCatchError()
  const user = useAtomValue(userAtom)
  const [loginErrors, setLoginErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const messageStyles = useMessageStyles()
  const [username, setUsername] = useState(user?.username ?? '')
  const [pat, setPat] = useState(user?.pat ?? '')

  const dismissError = useCallback(() => {
    setLoginErrors([])
  }, [setLoginErrors])

  const submitEnabled = useMemo(() => {
    return (
      username !== '' &&
      pat !== '' &&
      (username !== user?.username || pat !== user?.pat)
    )
  }, [username, pat, user])

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      setLoginErrors([])
      try {
        setLoading(true)
        const userErrors = await userService.authenticate(username, pat)
        if (userErrors.length > 0) {
          setLoginErrors(userErrors)
          setLoading(false)
        } else {
          setLoading(false)
          eventBus.emit('user-logged-in')
        }
      } catch (ex) {
        setLoading(false)
        await catchError(`Failed to save config. ${ex}`)
      }
    },
    [username, pat, setLoginErrors, catchError, setLoading],
  )

  return (
    <Card className={styles.card}>
      {loginErrors.length > 0 && (
        <Message
          messages={loginErrors}
          onClose={dismissError}
          className={messageStyles.error}
        />
      )}
      <form onSubmit={save}>
        <Field
          className={styles.field}
          // @ts-expect-error children signature
          label={{
            children: () => (
              <label htmlFor="username" className={styles.labelText}>
                GitHub Username
              </label>
            ),
          }}
        >
          <Input
            width="100%"
            type="text"
            id="username"
            value={username}
            disabled={loading}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field
          className={styles.field}
          // @ts-expect-error children signature
          label={{
            children: () => (
              <label htmlFor="PAT" className={styles.labelText}>
                Personal Access Token
              </label>
            ),
          }}
        >
          <PATMoreInfo />
          <Input
            type="password"
            id="PAT"
            value={pat}
            disabled={loading}
            onChange={(e) => setPat(e.target.value)}
          />
        </Field>

        <div className={styles.buttons}>
          <Button
            shape="circular"
            type="submit"
            disabled={!submitEnabled || loading}
            className={buttonStyles.primary}
          >
            {!loading && 'Login'}
            {loading && (
              <i className="codicon codicon-loading codicon-modifier-spin" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

const PATMoreInfo: FC = function PATMoreInfo() {
  return (
    <div>
      <p>
        A GitHub personal access token with repo rights is required.{' '}
        <a
          href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic"
          target="_blank"
          rel="noreferrer"
        >
          How to create a GitHub personal access token
        </a>
        . Provide a description for the token and an expiration period. Tokens
        with expirations will need to be regenerated and provided, here in the
        settings, after expiration for continued use of this application. Under
        &quot;Select scopes&quot;, check the top-level repo option. Select
        Generate token and copy the token to provide here. <br />
        <img
          src="./github-token-rights.png"
          alt="GitHub Access Tokens rights"
        />
        <br />
        <br />
      </p>
    </div>
  )
}
