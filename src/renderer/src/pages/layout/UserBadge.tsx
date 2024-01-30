import { Badge } from '@fluentui/react-components'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { formatDecimal } from '~/shared'

import { routes } from '../../App/index.js'
import { useCommunity } from '../../store/hooks/communityHooks.js'
import { useUser } from '../../store/hooks/userHooks.js'
import { useUserBadgeStyles } from './UserBadge.styles.js'

export const UserBadge: FC = function UserBadge() {
  const classes = useUserBadgeStyles()
  const user = useUser()
  const community = useCommunity()

  if (user == null) return <></>

  return (
    <div className={classes.settings}>
      <Link to={routes.settings.path} className={classes.navLink}>
        <i className={classes.navIcon + ' codicon codicon-account'} />
        {user.username}
        {community != null && (
          <Badge appearance="outline" color="subtle" size="large">
            <div>{formatDecimal(community.userVotingCredits)}</div>
          </Badge>
        )}
      </Link>
    </div>
  )
}
