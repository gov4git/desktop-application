import { Button, Field, InfoLabel, Input } from '@fluentui/react-components'
import { useAtom, useSetAtom } from 'jotai'
import { FC, FormEvent, useCallback, useState } from 'react'

import { useInsertCommunity } from '../hooks/communities.js'
import {
  communityDashboardStateAtom,
  newProjectUrlAtom,
} from '../state/community.js'
import { useCommunityJoinStyle } from './CommunityJoin2.styles.js'

export const CommunityJoin2: FC = function CommunityJoin2() {
  const [newProjectUrl, setNewProjectUrl] = useAtom(newProjectUrlAtom)
  const [loading, setLoading] = useState(false)
  const styles = useCommunityJoinStyle()
  const insertCommunity = useInsertCommunity()
  const setCommunityDashboardState = useSetAtom(communityDashboardStateAtom)

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()

      setLoading(true)
      await insertCommunity()
      setNewProjectUrl('')
      setLoading(false)
      setCommunityDashboardState('initial')
    },
    [setLoading, insertCommunity, setNewProjectUrl, setCommunityDashboardState],
  )

  return (
    <>
      <h2>Join a Community</h2>
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
          <Button onClick={() => setCommunityDashboardState('initial')}>
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
}
