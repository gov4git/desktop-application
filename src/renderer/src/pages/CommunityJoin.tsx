import { Badge, Text } from '@fluentui/react-components'

import { CommunityJoin } from '../components/index.js'
import { useBadgeStyles } from '../styles/index.js'
import { useCommunityJoinStyles } from './CommunityJoin.styles.js'

export const CommunityJoinPage = function LoginPage() {
  const loginStyles = useCommunityJoinStyles()
  const badgeStyles = useBadgeStyles()
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
