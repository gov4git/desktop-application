import { Card, Text } from '@fluentui/react-components'
import { type FC, useCallback } from 'react'

import { ButtonLink } from '../../components/index.js'
import { useDataStore } from '../../store/store.js'
import { useExceptionPanelStyles } from './ExceptionPanel.styles.js'

export const ExceptionPanel: FC = function ExceptionPanel() {
  const fetchLogs = useDataStore((s) => s.fetchLogs)
  const styles = useExceptionPanelStyles()
  const clearErrorMessage = useDataStore((s) => s.clearException)
  const errorMessage = useDataStore((s) => s.exception)

  const saveLogs = useCallback(async () => {
    const logs = await fetchLogs()
    const blob = new Blob([logs ?? ''], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'logs.txt'
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
    // navigator.clipboard.writeText(logs ?? '')
  }, [fetchLogs])

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
        {/* <Accordion collapsible>
          <AccordionItem value="1">
            <AccordionHeader>Logs</AccordionHeader>
            <AccordionPanel>
              <LogViewer height="300px" />
            </AccordionPanel>
          </AccordionItem>
        </Accordion> */}
        <Text size={500} weight="semibold">
          Next Steps
        </Text>
        <p>
          Please close and relaunch the application. If the error persists,
          please <ButtonLink onClick={saveLogs}>save</ButtonLink> the logs,{' '}
          <a
            href="https://github.com/gov4git/desktop-application/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            open a new issue
          </a>
          , and upload the saved log file to the issue.
        </p>
      </Card>
    </div>
  )
}
