import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Card,
  Text,
} from '@fluentui/react-components'
import { useCallback, useEffect, useState } from 'react'

import { ButtonLink } from '../../components/index.js'
import { logService } from '../../services/LogService.js'
import { useDataStore } from '../../store/store.js'
import { LicenseViewer } from './LicenseViewer.js'

export const AboutPage = function AboutPage() {
  const fetchLogs = useDataStore((s) => s.fetchLogs)
  const [version, setVersion] = useState('')
  const tryRun = useDataStore((s) => s.tryRun)

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

  const getVersion = useCallback(async () => {
    await tryRun(async () => {
      const ver = await logService.getAppVersion()
      setVersion(ver)
    }, 'Failed to load app version.')
  }, [setVersion, tryRun])

  useEffect(() => {
    void getVersion()
  }, [getVersion])

  return (
    <Card>
      <h1 style={{ lineHeight: '0', paddingTop: '20px' }}>About Gov4Git</h1>
      <Text weight="medium" size={300}>
        Version: {version}
      </Text>
      <p>
        gov4git is a decentralized protocol for governing open-source
        communities based on git.
      </p>
      <p>
        It is a wholistic framework for lifelong governance of open-source
        projects, which is secure, flexible, transparent, and pluralistic.
      </p>
      <p>
        gov4git is designed to be practical and accessible. It requires git
        hosting as the only persistent infrastructure. It is easy to deploy by
        non-technical users, using an accompanying command-line client or a
        desktop app.
      </p>
      <div>
        <Accordion collapsible multiple>
          <AccordionItem value="1">
            <AccordionHeader>
              <Text weight="medium">Report An Issue</Text>
            </AccordionHeader>
            <AccordionPanel>
              <p>
                Please close and relaunch the application. If the error
                persists, please{' '}
                <ButtonLink onClick={saveLogs}>save</ButtonLink> the logs,{' '}
                <a
                  href="https://github.com/gov4git/desktop-application/issues/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  open a new issue
                </a>
                , and upload the saved log file to the issue.
              </p>
              {/* <LogViewer height="300px" /> */}
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionHeader>
              <Text weight="medium">View License</Text>
            </AccordionHeader>
            <AccordionPanel>
              <LicenseViewer height="300px" />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
      <div>
        <a
          href="https://github.com/orgs/gov4git/repositories"
          target="_blank"
          rel="noreferrer"
        >
          GitHub Org
        </a>
      </div>
    </Card>
  )
}
