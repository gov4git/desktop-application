import { Badge, Text } from '@fluentui/react-components'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/Router.js'
import { Login } from '../components/index.js'
import { eventBus } from '../lib/index.js'
import { useBadgeStyles } from '../styles/index.js'
import { useLoginStyles } from './Login.styles.js'

export const LoginPage = function LoginPage() {
  const loginStyles = useLoginStyles()
  const badgeStyles = useBadgeStyles()
  const navigate = useNavigate()

  useEffect(() => {
    return eventBus.subscribe('new-user', () => {
      navigate(routes.communityJoin.path)
    })
  }, [navigate])

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
      <Login />
    </>
  )
}
