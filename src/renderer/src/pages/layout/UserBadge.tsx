import { Badge, Tooltip } from '@fluentui/react-components'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { formatDecimal } from '~/shared'

import { routes } from '../../App/index.js'
import { Loader } from '../../components/Loader.js'
import { useDataStore } from '../../store/store.js'
import { useUserBadgeStyles } from './UserBadge.styles.js'

export const UserBadge: FC = function UserBadge() {
  const classes = useUserBadgeStyles()
  const user = useDataStore((s) => s.userInfo.user)
  const community = useDataStore((s) => s.communityInfo.selectedCommunity)
  const communityLoading = useDataStore((s) => s.communityInfo.loading)

  if (user == null) return <></>

  return (
    <div className={classes.settings}>
      <Link to={routes.settings.path} className={classes.navLink}>
        <i className={classes.navIcon + ' codicon codicon-account'} />
        {user.username}
        <Loader isLoading={communityLoading} size="tiny">
          {community != null && (
            <Tooltip
              content={`You have ${community.userVotingCredits} voting credits in the ${community.name} community.`}
              relationship="description"
            >
              <Badge appearance="outline" color="subtle" size="large">
                <div>{formatDecimal(community.userVotingCredits)}</div>
              </Badge>
            </Tooltip>
          )}
        </Loader>
      </Link>
    </div>
  )
}
