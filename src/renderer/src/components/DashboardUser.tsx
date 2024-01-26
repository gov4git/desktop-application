import { Card } from '@fluentui/react-components'

import { useCardStyles, useHeadingsStyles } from '../styles/index.js'
import { Login } from './index.js'

export const DashboardUser = function DashboardUser() {
  const headerStyles = useHeadingsStyles()
  const cardStyles = useCardStyles()

  return (
    <>
      {/* <h2 className={headerStyles.pageHeading}>User Settings</h2> */}
      <Card className={cardStyles.primary}>
        <Login />
      </Card>
    </>
  )
}
