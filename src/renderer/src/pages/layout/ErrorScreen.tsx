import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Card,
  Text,
} from '@fluentui/react-components'
import { type FC, useCallback } from 'react'

import { LogViewer } from '../../components/index.js'
import { useDataStore } from '../../store/store.js'
import { useErrorScreenStyles } from './ErrorScreen.styles.js'

export const ErrorScreen: FC = function ErrorScreen() {
  const styles = useErrorScreenStyles()
  const clearErrorMessage = useDataStore((s) => s.clearError)
  const errorMessage = useDataStore((s) => s.error)

  const onClose = useCallback(() => {
    clearErrorMessage()
  }, [clearErrorMessage])

  if (errorMessage == null || errorMessage === '') {
    return <></>
  }

  return (
    <div className={styles.root}>
      <Card>
        <button title="close errors" className={styles.close} onClick={onClose}>
          <i className="codicon codicon-chrome-close" />
        </button>
        <Text size={500} weight="semibold">
          Error
        </Text>
        <p>Message: {errorMessage}</p>
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
