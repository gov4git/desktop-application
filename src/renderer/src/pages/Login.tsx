import { Badge, Card, Text } from '@fluentui/react-components'

import { routes } from '../App/Router.js'
import { Login } from '../components/index.js'
import { useBadgeStyles, useCardStyles } from '../styles/index.js'
import { useLoginStyles } from './Login.styles.js'

export const LoginPage = function LoginPage() {
  const loginStyles = useLoginStyles()
  const badgeStyles = useBadgeStyles()
  const cardStyles = useCardStyles()

  return (
    <>
      <div className={loginStyles.title}>
        <Badge
          className={badgeStyles.primary}
          size="extra-large"
          shape="circular"
        >
          <Text size={500}>1</Text>
        </Badge>
        <h1 className={loginStyles.pageHeading}>Login</h1>
      </div>
      <Card className={cardStyles.primary}>
        <Login redirectOnLogin={routes.communityJoin.path} />
      </Card>
    </>
  )
}
