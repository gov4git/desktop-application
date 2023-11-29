import {
  Button,
  Card,
  Field,
  Input,
} from '@fluentui/react-components'
import { useAtom, useAtomValue } from 'jotai'
import { FC, FormEvent, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/index.js'
import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/index.js'
import { communityService } from '../services/CommunityService.js'
import { settingsService } from '../services/SettingsService.js'
import { userService } from '../services/UserService.js'
import { communityAtom } from '../state/community.js'
import { configErrorsAtom } from '../state/config.js'
import { userAtom } from '../state/user.js'
import { useButtonStyles } from '../styles/index.js'
import { useMessageStyles } from '../styles/messages.js'
import { Message } from './Message.js'
import { useSettingsFormsStyles } from './SettingsForm.styles.js'

export const SettingsForm = function SettingsForm() {
  const styles = useSettingsFormsStyles()
  const buttonStyles = useButtonStyles()
  const navigate = useNavigate()
  const [unsavedChanges, setUnsavedChanges] = useState(true)
  const catchError = useCatchError()
  const user = useAtomValue(userAtom)
  const community = useAtomValue(communityAtom)
  const [configErrors, setConfigErrors] = useAtom(configErrorsAtom)
  const [loading, setLoading] = useState(false)
  const messageStyles = useMessageStyles()
  const [username, setUsername] = useState(user?.username ?? '')
  const [pat, setPat] = useState(user?.pat ?? '')
  const [projectUrl, setProjectUrl] = useState(community?.projectUrl ?? '')

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      setConfigErrors([])
      try {
        setLoading(true)
        const userErrors = await userService.authenticate(username, pat)
        if (userErrors.length > 0) {
          setConfigErrors(userErrors)
          setLoading(false)
        } else {
          const communityErrors =
            await communityService.insertCommunity(projectUrl)
          if (communityErrors.length > 0) {
            setConfigErrors(communityErrors)
            setLoading(false)
          } else {
            await settingsService.generateConfig()
            setUnsavedChanges(false)
            setLoading(false)
            eventBus.emit('user-logged-in')
          }
        }
      } catch (ex) {
        setLoading(false)
        await catchError(`Failed to save config. ${ex}`)
      }
    },
    [
      setUnsavedChanges,
      username,
      pat,
      projectUrl,
      setConfigErrors,
      catchError,
      setLoading,
    ],
  )

  const reset = useCallback(() => {
    setUnsavedChanges(false)
    navigate(routes.issues.path)
  }, [setUnsavedChanges, navigate])

  const onClose = useCallback(() => {
    setConfigErrors([])
  }, [setConfigErrors])

  return (
    <Card className={styles.card}>
      {configErrors.length > 0 && (
        <Message
          messages={configErrors}
          onClose={onClose}
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
        <Field
          className={styles.field}
          // @ts-expect-error children signature
          label={{
            children: () => (
              <label htmlFor="communityRepoUrl" className={styles.labelText}>
                Community URL
              </label>
            ),
          }}
        >
          <CommunityUrlMoreInfo />
          <Input
            type="url"
            id="communityRepoUrl"
            value={projectUrl}
            disabled={loading}
            onChange={(e) => setProjectUrl(e.target.value)}
          />
        </Field>

        <div className={styles.buttons}>
          <Button shape="circular" onClick={reset} disabled={loading}>
            Cancel
          </Button>
          <Button
            shape="circular"
            type="submit"
            disabled={!unsavedChanges || loading}
            className={buttonStyles.primary}
          >
            {!loading && 'Save'}
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

const CommunityUrlMoreInfo: FC = function CommunityUrlMoreInfo() {
  return (
    <div>
      <p>
        URL to a GitHub hosted community repo provided by a community maintainer
        is required.
      </p>
    </div>
  )
}
