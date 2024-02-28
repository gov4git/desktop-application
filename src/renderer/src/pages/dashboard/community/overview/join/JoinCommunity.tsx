import { Button, Field, InfoLabel, Input } from '@fluentui/react-components'
import { FC, FormEvent, memo, useCallback, useState } from 'react'

import { Message } from '../../../../../components/Message.js'
import { useDataStore } from '../../../../../store/store.js'
import { useMessageStyles } from '../../../../../styles/index.js'
import { useJoinCommunityStyles } from './JoinCommunity.styles.js'

export const JoinCommunity: FC = memo(function JoinCommunity() {
  const messageStyles = useMessageStyles()
  const [newProjectUrl, setNewProjectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const styles = useJoinCommunityStyles()
  const joinCommunity = useDataStore((s) => s.joinCommunity)
  const [errors, setErrors] = useState<string[]>([])
  const setCommunityOverviewState = useDataStore(
    (s) => s.communityOverview.setState,
  )

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()

      setLoading(true)
      const errors = await joinCommunity(newProjectUrl)
      setErrors(errors)
      setNewProjectUrl('')
      setLoading(false)
      if (errors.length === 0) {
        setCommunityOverviewState('overview')
      }
    },
    [
      setLoading,
      joinCommunity,
      setNewProjectUrl,
      setCommunityOverviewState,
      newProjectUrl,
      setErrors,
    ],
  )

  const dismissError = useCallback(() => {
    setErrors([])
  }, [setErrors])

  return (
    <>
      <h2>Join a Community</h2>
      {errors.length > 0 && (
        <Message
          messages={errors}
          onClose={dismissError}
          className={messageStyles.error}
        />
      )}
      <form onSubmit={save}>
        <Field
          className={styles.inputField}
          // @ts-expect-error children signature
          label={{
            children: () => (
              <InfoLabel
                info={<>URL to a GitHub hosted Gov4Git community repo.</>}
                htmlFor="communityRepoUrl"
              >
                Community URL
              </InfoLabel>
            ),
          }}
        >
          <Input
            type="url"
            id="communityRepoUrl"
            value={newProjectUrl}
            disabled={loading}
            onChange={(e) => setNewProjectUrl(e.target.value)}
          />
        </Field>
        <div className={styles.formRow}>
          <Button onClick={() => setCommunityOverviewState('overview')}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            type="submit"
            disabled={loading || newProjectUrl.trim() === ''}
          >
            {!loading && 'Request to Join'}
            {loading && (
              <i className="codicon codicon-loading codicon-modifier-spin" />
            )}
          </Button>
        </div>
      </form>
    </>
  )
})
