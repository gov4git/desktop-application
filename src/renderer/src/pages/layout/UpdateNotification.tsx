import { Button, Text } from '@fluentui/react-components'
import { FC, useCallback } from 'react'

import { StyledCard } from '../../components/index.js'
import { appUpdaterService } from '../../services/AppUpdaterService.js'
import { useGlobalAppUpdateInfo } from '../../store/hooks/globalHooks.js'
import { useDataStore } from '../../store/store.js'
import { useUpdateNotificationStyles } from './UpdateNotification.styles.js'

export const UpdateNotification: FC = function UpdateNotification() {
  const tryRun = useDataStore((s) => s.tryRun)
  const updates = useGlobalAppUpdateInfo()
  const styles = useUpdateNotificationStyles()

  const update = useCallback(async () => {
    await tryRun(async () => {
      appUpdaterService.restartAndUpdate()
    }, 'Failed to restart application for updates.')
  }, [tryRun])

  if (updates === null) {
    return <></>
  }

  return (
    <div className={styles.root}>
      <StyledCard>
        <p>
          <Text size={300} weight="medium">
            {!updates.ready && (
              <span>
                A new version of Gov4Git is available. Downloading{' '}
                {updates.version}.
              </span>
            )}
            {updates.ready && (
              <span>
                A new version of Gov4Git is available. Restart to install{' '}
                {updates.version}.
              </span>
            )}
          </Text>
        </p>
        <div className={styles.updateRow}>
          <Button size="small" onClick={update} disabled={!updates.ready}>
            {!updates.ready && (
              <i className="codicon codicon-loading codicon-modifier-spin" />
            )}
            {updates.ready && 'Update Now'}
          </Button>
        </div>
      </StyledCard>
    </div>
  )
}
