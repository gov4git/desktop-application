import { Card } from '@fluentui/react-components'

import { LogViewer } from '../components/index.js'

export const LogsPage = function LogsPage() {
  return (
    <Card>
      <h1>Logs</h1>
      <LogViewer height="500px" />
    </Card>
  )
}
