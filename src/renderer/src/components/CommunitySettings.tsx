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
import { useAtom, useAtomValue } from 'jotai'
import { FC, FormEvent, useCallback, useEffect, useState } from 'react'

import { useInsertCommunity, useSelectCommunity } from '../hooks/communities.js'
import {
  communitiesAtom,
  communityAtom,
  insertCommunityErrors,
  newProjectUrlAtom,
  selectedCommunityUrlAtom,
} from '../state/community.js'
import { useButtonStyles } from '../styles/index.js'
import { useMessageStyles } from '../styles/messages.js'
import { useCommunitySettingsStyle } from './CommunitySettings.styles.js'
import { Message } from './Message.js'

export const CommunitySettings: FC = function CommunitySettings() {
  const communities = useAtomValue(communitiesAtom)
  const selectedCommunity = useAtomValue(communityAtom)
  const [selectedCommunityUrl, setSelectedCommunityUrl] = useAtom(
    selectedCommunityUrlAtom,
  )
  const [status, setStatus] = useState<Record<string, string>>({})
  const [communityPages, setCommunityPages] = useState<Record<string, string>>(
    {},
  )
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [newProjectUrl, setNewProjectUrl] = useAtom(newProjectUrlAtom)
  const [communityErrors, setCommunityErrors] = useAtom(insertCommunityErrors)
  const messageStyles = useMessageStyles()
  const buttonStyles = useButtonStyles()
  const [loading, setLoading] = useState(false)
  const styles = useCommunitySettingsStyle()
  const insertCommunity = useInsertCommunity()
  const selectCommunity = useSelectCommunity()

  useEffect(() => {
    setLoading(false)
    setNewProjectUrl('')
    setShowJoinForm(false)
  }, [communities, setLoading, setNewProjectUrl, setShowJoinForm])

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()

      setLoading(true)
      await insertCommunity()
      setNewProjectUrl('')
      setLoading(false)
    },
    [setLoading, insertCommunity, setNewProjectUrl],
  )

  const dismissError = useCallback(() => {
    setCommunityErrors([])
  }, [setCommunityErrors])

  useEffect(() => {
    setSelectedCommunityUrl(selectedCommunity?.url ?? '')
  }, [selectedCommunity, setSelectedCommunityUrl])

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
        s = 'Denied'
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

  return (
    <Card className={styles.card}>
      {communityErrors.length > 0 && (
        <Message
          messages={communityErrors}
          onClose={dismissError}
          className={messageStyles.error}
        />
      )}
      {communities.length > 0 && (
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
      )}
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
          Join a Community
        </Button>
      )}
    </Card>
  )
}
