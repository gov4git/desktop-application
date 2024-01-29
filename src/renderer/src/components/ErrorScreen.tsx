import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Card,
  Text,
} from '@fluentui/react-components'
import { type FC, useCallback } from 'react'

import { useSetGlobalError } from '../store/hooks/globalHooks.js'
import { useErrorScreenStyles } from './ErrorScreen.styles.js'
import { LogViewer } from './LogViewer.js'

export type ErrorScreenProps = {
  message: string
  showClose?: boolean
}

export const ErrorScreen: FC<ErrorScreenProps> = function ErrorScreen({
  message,
  showClose = false,
}) {
  const styles = useErrorScreenStyles()
  const setErrorMessage = useSetGlobalError()

  const onClose = useCallback(() => {
    setErrorMessage('')
  }, [setErrorMessage])

  return (
    <div className={styles.root}>
      <Card>
        {showClose && (
          <button
            title="close errors"
            className={styles.close}
            onClick={onClose}
          >
            <i className="codicon codicon-chrome-close" />
          </button>
        )}
        <Text size={500} weight="semibold">
          Error
        </Text>
        <p>Message: {message}</p>
        <Accordion collapsible>
          <AccordionItem value="1">
            <AccordionHeader>Logs</AccordionHeader>
            <AccordionPanel>
              <LogViewer height="300px" />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Text size={500} weight="semibold">
          Next Steps
        </Text>
        <p>
          Please try refreshing the application and/or relaunching the
          application. If the error persists please copy the above logs and{' '}
          <a
            href="https://github.com/gov4git/desktop-application/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            open a new issue
          </a>
          .
        </p>
      </Card>
    </div>
  )
}
