import { Button, Field, InfoLabel, Input } from '@fluentui/react-components'
import { FC, FormEvent, memo, useCallback, useState } from 'react'

import {
  useCommunityProjectJoinUrl,
  useJoinCommunity,
  useSetCommunityDashboardState,
  useSetCommunityProjectJoinUrl,
} from '../../../../store/hooks/communityHooks.js'
import { useJoinCommunityStyles } from './styles.js'

export const JoinCommunity: FC = memo(function JoinCommunity() {
  const newProjectUrl = useCommunityProjectJoinUrl()
  const setNewProjectUrl = useSetCommunityProjectJoinUrl()
  const [loading, setLoading] = useState(false)
  const styles = useJoinCommunityStyles()
  const insertCommunity = useJoinCommunity()
  const setCommunityDashboardState = useSetCommunityDashboardState()

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
})
