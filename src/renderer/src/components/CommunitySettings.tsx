import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Add32Filled } from '@fluentui/react-icons'
import { useAtomValue } from 'jotai'
import { FC, FormEvent, useCallback, useEffect, useState } from 'react'

import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/index.js'
import { communityService } from '../services/index.js'
import { communitiesAtom, communityAtom } from '../state/community.js'
import { useButtonStyles } from '../styles/index.js'
import { useMessageStyles } from '../styles/messages.js'
import { useCommunitySettingsStyle } from './CommunitySettings.styles.js'
import { Message } from './Message.js'

export const CommunitySettings: FC = function CommunitySettings() {
  const communities = useAtomValue(communitiesAtom)
  const selectedCommunity = useAtomValue(communityAtom)
  const [selectedCommunityUrl, setSelectedCommunityUrl] = useState('')
  const [status, setStatus] = useState<Record<string, string>>({})
  const [requestLinks, setRequestLinks] = useState<Record<string, string>>({})
  const [communityPages, setCommunityPages] = useState<Record<string, string>>(
    {},
  )
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [newProjectUrl, setNewProjectUrl] = useState('')
  const [communityErrors, setCommunityErrors] = useState<string[]>([])
  const catchError = useCatchError()
  const messageStyles = useMessageStyles()
  const buttonStyles = useButtonStyles()
  const [loading, setLoading] = useState(false)
  const styles = useCommunitySettingsStyle()

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      setCommunityErrors([])
      try {
        setLoading(true)
        const communityErrors =
          await communityService.insertCommunity(newProjectUrl)
        if (communityErrors.length > 0) {
          setLoading(false)
          setCommunityErrors(communityErrors)
        } else {
          eventBus.emit('community-saved')
        }
      } catch (ex) {
        await catchError(`Failed to save config. ${ex}`)
      }
    },
    [setCommunityErrors, catchError, newProjectUrl, setLoading],
  )

  const selectCommunity = useCallback(
    async (url: string) => {
      setSelectedCommunityUrl(url)
      try {
        await communityService.selectCommunity(url)
        eventBus.emit('selected-community')
      } catch (ex) {
        await catchError(`Failed to select community ${url}. ${ex}`)
      }
    },
    [setSelectedCommunityUrl, catchError],
  )

  const dismissError = useCallback(() => {
    setCommunityErrors([])
  }, [setCommunityErrors])

  useEffect(() => {
    setSelectedCommunityUrl(selectedCommunity?.url ?? '')
  }, [selectedCommunity, setSelectedCommunityUrl])

  useEffect(() => {
    return eventBus.subscribe('new-community', () => {
      setLoading(false)
      setNewProjectUrl('')
      setShowJoinForm(false)
    })
  }, [setNewProjectUrl, setLoading, setShowJoinForm])

  useEffect(() => {
    for (const c of communities) {
      const l = `<a href="${c.projectUrl}" target="_blank">${c.name}</a>`
      setCommunityPages((p) => {
        return {
          ...p,
          [c.url]: l,
        }
      })
    }
  }, [communities, setCommunityPages])

  useEffect(() => {
    for (const c of communities) {
      let s = ''
      if (c.isMember) {
        s = 'Approved'
      } else if (
        c.joinRequestStatus != null &&
        c.joinRequestStatus === 'open'
      ) {
        s = 'Pending'
      } else if (
        c.joinRequestStatus != null &&
        c.joinRequestStatus === 'closed'
      ) {
        s = 'Closed'
      } else {
        s = 'Not Available'
      }
      let l = ''
      if (c.joinRequestUrl != null && c.joinRequestUrl !== '') {
        l = `<a href="${c.joinRequestUrl}" target="_blank">View Request</a>`
      }
      setStatus((statuses) => {
        return {
          ...statuses,
          [c.url]: `${s}. ${l}`,
        }
      })
    }
  }, [communities, setStatus])

  useEffect(() => {
    for (const c of communities) {
      let l = ''
      if (c.joinRequestUrl != null && c.joinRequestUrl !== '') {
        l = `<a href="${c.joinRequestUrl}" target="_blank">View Request</a>`
      }
      setRequestLinks((requests) => {
        return {
          ...requests,
          [c.url]: l,
        }
      })
    }
  }, [communities, setRequestLinks])

  return (
    <Card className={styles.card}>
      {communityErrors.length > 0 && (
        <Message
          messages={communityErrors}
          onClose={dismissError}
          className={messageStyles.error}
        />
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell className={styles.firstCol}></TableHeaderCell>
            <TableHeaderCell>Community</TableHeaderCell>
            <TableHeaderCell>Membership Status</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {communities.map((c) => (
            <TableRow key={c.url}>
              <TableCell className={styles.firstCol}>
                <Checkbox
                  disabled={!c.isMember}
                  checked={c.url === selectedCommunityUrl}
                  onChange={() => selectCommunity(c.url)}
                />
              </TableCell>
              <TableCell>
                <span
                  dangerouslySetInnerHTML={{
                    __html: communityPages[c.url] ?? '',
                  }}
                ></span>
              </TableCell>
              <TableCell>
                <span
                  dangerouslySetInnerHTML={{
                    __html: status[c.url] ?? '',
                  }}
                ></span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
      {showJoinForm && (
        <form onSubmit={save}>
          <div className={styles.formRow}>
            <Field
              className={styles.inputField}
              // @ts-expect-error children signature
              label={{
                children: () => (
                  <label htmlFor="communityRepoUrl">Community URL</label>
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
            <Button
              shape="circular"
              type="submit"
              disabled={loading || newProjectUrl.trim() === ''}
              className={buttonStyles.primary}
            >
              {!loading && 'Request to Join'}
              {loading && (
                <i className="codicon codicon-loading codicon-modifier-spin" />
              )}
            </Button>
          </div>
        </form>
      )}
      {!showJoinForm && (
        <Button
          appearance="primary"
          disabled={loading}
          icon={!loading ? <Add32Filled /> : <></>}
          onClick={() => setShowJoinForm(true)}
        >
          Join a New Community
        </Button>
      )}
    </Card>
  )
}
