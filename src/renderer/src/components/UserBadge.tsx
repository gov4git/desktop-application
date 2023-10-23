import { Badge } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { routes } from '../App/index.js'
import { formatDecimal } from '../lib/numbers.js'
import { userAtom } from '../state/user.js'
import { useUserBadgeStyles } from './UserBadge.styles.js'

export const UserBadge: FC = function UserBadge() {
  const classes = useUserBadgeStyles()
  const user = useAtomValue(userAtom)

  if (user == null) return <></>

  return (
    <div className={classes.settings}>
      <Link to={routes.settings.path} className={classes.navLink}>
        <i className={classes.navIcon + ' codicon codicon-account'} />
        {user.username}
        <Badge appearance="outline" color="subtle" size="large">
          <div>{formatDecimal(user.voting_credits ?? 0)}</div>
        </Badge>
      </Link>
    </div>
  )
}
