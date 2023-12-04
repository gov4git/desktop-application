import { Button, Card, Field, Input } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { FC, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/index.js'
import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/index.js'
import { communityService } from '../services/CommunityService.js'
import { communityAtom } from '../state/community.js'
import { useButtonStyles, useMessageStyles } from '../styles/index.js'
import { useCommunityJoinStyles } from './CommunityJoin.styles.js'
import { Message } from './Message.js'

export const CommunityJoin: FC = function Login() {
  const styles = useCommunityJoinStyles()
  const buttonStyles = useButtonStyles()
  const catchError = useCatchError()
  const [communityErrors, setCommunityErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const messageStyles = useMessageStyles()
  const community = useAtomValue(communityAtom)
  const [projectUrl, setProjectUrl] = useState(community?.projectUrl ?? '')
  const [statusMessage, setStatusMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let message = ''
    if (community?.isMember) {
      navigate(routes.issues.path)
      // message = `Your request has been approved. You are a member of ${community.name}.`
    } else if (community?.joinRequestStatus === 'closed') {
      message = `Your request is closed. `
    } else if (community?.joinRequestStatus === 'open') {
      message = `Your request to join ${community.name} is pending.`
    }
    if (community?.joinRequestUrl != null) {
      message += ` <a href="${community.joinRequestUrl}" target="_blank" rel="noreferrer">View your request in GitHub</a>`
    }
    if (projectUrl !== community?.projectUrl) {
      message = ''
    }
    setStatusMessage(message)
  }, [community, setStatusMessage, navigate, projectUrl])

  const dismissError = useCallback(() => {
    setCommunityErrors([])
  }, [setCommunityErrors])

  const submitEnabled = useMemo(() => {
    return (
      projectUrl !== '' &&
      (community?.projectUrl != projectUrl || statusMessage === '')
    )
  }, [projectUrl, statusMessage, community])

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      setCommunityErrors([])
      try {
        setLoading(true)
        const communityErrors =
          await communityService.insertCommunity(projectUrl)
        if (communityErrors.length > 0) {
          setCommunityErrors(communityErrors)
          setLoading(false)
        } else {
          setLoading(false)
          eventBus.emit('community-saved')
        }
      } catch (ex) {
        setLoading(false)
        await catchError(`Failed to save config. ${ex}`)
      }
    },
    [setCommunityErrors, catchError, setLoading, projectUrl],
  )

  return (
    <Card className={styles.card}>
      {communityErrors.length > 0 && (
        <Message
          messages={communityErrors}
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
          <Button
            shape="circular"
            type="submit"
            disabled={!submitEnabled || loading}
            className={buttonStyles.primary}
          >
            {!loading && 'Request to Join'}
            {loading && (
              <i className="codicon codicon-loading codicon-modifier-spin" />
            )}
          </Button>
        </div>
      </form>
      {statusMessage !== '' && (
        <div>
          <p dangerouslySetInnerHTML={{ __html: statusMessage }}></p>
        </div>
      )}
    </Card>
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
