import { Button, Card, Text } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { FC, useCallback } from 'react'

import { useCatchError } from '../hooks/useCatchError.js'
import { appUpdaterService } from '../services/AppUpdaterService.js'
import { updatesAtom } from '../state/updates.js'
import { useUpdateNotificationStyles } from './UpdateNotification.styles.js'

export const UpdateNotification: FC = function UpdateNotification() {
  const catchError = useCatchError()
  const updates = useAtomValue(updatesAtom)
  const styles = useUpdateNotificationStyles()

  const update = useCallback(() => {
    appUpdaterService.restartAndUpdate().catch(async (ex) => {
      await catchError(`Failed to restart for updates. ${ex}`)
    })
  }, [catchError])

  if (updates === null) {
    return <></>
  }

  return (
    <div className={styles.root}>
      <Card>
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
      </Card>
    </div>
  )
}
