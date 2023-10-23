import { Button, Card, Text } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { FC, useCallback } from 'react'

import { useCatchError } from '../hooks/useCatchError.js'
import { restartAndUpdate } from '../services/updates.js'
import { updatesAtom } from '../state/updates.js'
import { useUpdateNotificationStyles } from './UpdateNotification.styles.js'

export const UpdateNotification: FC = function UpdateNotification() {
  const catchError = useCatchError()
  const updates = useAtomValue(updatesAtom)
  const styles = useUpdateNotificationStyles()

  const update = useCallback(() => {
    restartAndUpdate().catch(async (ex) => {
      await catchError(`Failed to restart for updates. ${ex}`)
    })
  }, [catchError])

  if (updates === false) {
    return <></>
  }

  return (
    <div className={styles.root}>
      <Card>
        <p>
          <Text size={300} weight="medium">
            A new version of Gov4Git is available. Restart to get the latest
            update.
          </Text>
        </p>
        <div className={styles.updateRow}>
          <Button size="small" onClick={update}>
            Update Now
          </Button>
        </div>
      </Card>
    </div>
  )
}
