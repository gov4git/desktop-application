import { Badge, Text } from '@fluentui/react-components'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/Router.js'
import { CommunityJoin } from '../components/index.js'
import { eventBus } from '../lib/index.js'
import { useBadgeStyles } from '../styles/index.js'
import { useCommunityJoinStyles } from './CommunityJoin.styles.js'

export const CommunityJoinPage = function LoginPage() {
  const loginStyles = useCommunityJoinStyles()
  const badgeStyles = useBadgeStyles()
  const navigate = useNavigate()

  useEffect(() => {
    return eventBus.subscribe('new-community', () => {
      navigate(routes.issues.path)
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
          <Text size={500}>2</Text>
        </Badge>
        <h1 className={loginStyles.pageHeading}>Join a Community</h1>
      </div>
      <CommunityJoin />
    </>
  )
}
