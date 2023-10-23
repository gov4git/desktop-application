import {
  Button,
  Card,
  Field,
  Input,
  LabelProps,
} from '@fluentui/react-components'
import { InfoLabel } from '@fluentui/react-components/unstable'
import { useAtom, useAtomValue } from 'jotai'
import { FC, FormEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Config } from '~/shared'

import { routes } from '../App/index.js'
import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/eventBus.js'
import { createNestedRecord, mergeDeep } from '../lib/index.js'
import { configService } from '../services/ConfigService.js'
import { configAtom, configErrorsAtom } from '../state/config.js'
import { useButtonStyles } from '../styles/index.js'
import { ShowError } from './Error.js'
import { useSettingsFormsStyles } from './SettingsForm.styles.js'

export const SettingsForm = function SettingsForm() {
  const styles = useSettingsFormsStyles()
  const buttonStyles = useButtonStyles()
  const navigate = useNavigate()
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [formConfig, setFormConfig] = useState<Partial<Config>>({})
  const catchError = useCatchError()
  const config = useAtomValue(configAtom)
  const [configErrors, setConfigErrors] = useAtom(configErrorsAtom)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (config != null) {
      setFormConfig((c) => {
        return mergeDeep({}, c, config)
      })
    }
  }, [config, setFormConfig])

  const updateConfig = useCallback(
    (key: string, value: string) => {
      setUnsavedChanges(true)
      const obj = createNestedRecord<Partial<Config>>({
        [key]: value,
      })
      setFormConfig((c) => {
        return mergeDeep({}, c, obj)
      })
    },
    [setFormConfig, setUnsavedChanges],
  )

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      setConfigErrors([])
      try {
        setLoading(true)
        const errors = await configService.createOrUpdateConfig(formConfig)
        if (errors.length > 0) {
          setConfigErrors(errors)
          setLoading(false)
        } else {
          setUnsavedChanges(false)
          setLoading(false)
          eventBus.emit('user-logged-in')
        }
      } catch (ex) {
        await catchError(`Failed to save config. ${ex}`)
      }
    },
    [setUnsavedChanges, formConfig, setConfigErrors, catchError, setLoading],
  )

  const reset = useCallback(() => {
    setFormConfig({})
    setUnsavedChanges(false)
    navigate(routes.issues.path)
  }, [setFormConfig, setUnsavedChanges, navigate])

  const onClose = useCallback(() => {
    setConfigErrors([])
  }, [setConfigErrors])

  return (
    <Card className={styles.card}>
      {configErrors.length > 0 && (
        <ShowError messages={configErrors} onClose={onClose} />
      )}
      <form onSubmit={save}>
        <Field
          className={styles.field}
          // @ts-expect-error children signature
          label={{
            children: () => (
              <span className={styles.labelText}>Github Username</span>
            ),
          }}
        >
          <Input
            type="text"
            id="username"
            value={formConfig.user?.username ?? ''}
            disabled={loading}
            onChange={(e) => updateConfig('user.username', e.target.value)}
          />
        </Field>
        <Field
          className={styles.field}
          // @ts-expect-error children signature
          label={{
            children: (_: unknown, slotProps: LabelProps) => (
              <InfoLabel
                {...slotProps}
                // @ts-expect-error Complaining about incompatible ReactElement types
                info={{
                  children: PATMoreInfo,
                }}
                aria-label="Please provide your GitHub access token."
              >
                <span className={styles.labelText}>Personal Access Token</span>
              </InfoLabel>
            ),
          }}
        >
          <Input
            type="password"
            id="PAT"
            value={formConfig.user?.pat ?? ''}
            disabled={loading}
            onChange={(e) => updateConfig('user.pat', e.target.value)}
          />
        </Field>
        <Field
          className={styles.field}
          // @ts-expect-error children signature
          label={{
            children: (_: unknown, slotProps: LabelProps) => (
              <InfoLabel
                {...slotProps}
                // @ts-expect-error Complaining about incompatible ReactElement types
                info={{
                  children: CommunityUrlMoreInfo,
                }}
              >
                <span className={styles.labelText}>Community URL</span>
              </InfoLabel>
            ),
          }}
        >
          <Input
            type="url"
            id="communityRepoUrl"
            value={formConfig?.project_repo ?? ''}
            disabled={loading}
            onChange={(e) => updateConfig('project_repo', e.target.value)}
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