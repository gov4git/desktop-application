import { Tooltip } from '@fluentui/react-components'
import { FC, useCallback, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { routes } from '../../App/index.js'
import { useDataStore } from '../../store/store.js'
import { useSiteNavStyles } from './SiteNav.styles.js'

export const SiteNav: FC = function SiteNav() {
  const styles = useSiteNavStyles()
  const user = useDataStore((s) => s.userInfo.user)
  const community = useDataStore((s) => s.communityInfo.selectedCommunity)
  const [pinned, setPinned] = useState('')

  const onExpand = useCallback(() => {
    setPinned((p) => {
      if (p === '') {
        return 'pinned'
      } else {
        return ''
      }
    })
  }, [setPinned])

  if (community == null || !community.isMember) {
    return <></>
  }

  return (
    <nav className={styles.navContainer + ' ' + pinned}>
      <div className={styles.relativeContainer + ' ' + pinned}>
        <div className={styles.absoluteContainer + ' ' + pinned}>
          <div className={styles.reset}>
            <div className={styles.expandContainer}>
              <button
                className={styles.epandLink}
                onClick={onExpand}
                aria-label={
                  pinned === ''
                    ? 'Expand navigation menu'
                    : 'Collapse navigation menu'
                }
                aria-haspopup="menu"
                aria-pressed={pinned !== ''}
                aria-expanded={pinned !== ''}
              >
                <div className={styles.linkIconContainer}>
                  <Tooltip
                    content={pinned === '' ? 'Expand' : 'Collapse'}
                    relationship="description"
                  >
                    <i
                      className={
                        styles.linkIcon +
                        ' codicon codicon-chevron-right ' +
                        pinned
                      }
                    />
                  </Tooltip>
                </div>
              </button>
            </div>
            {user &&
              Object.entries(routes).map(([key, route]) => {
                if (!route.siteNav || route.footer) return
                if (!community?.isMaintainer && route.forAdmin) return
                return (
                  <div key={key} className={styles.linkContainer}>
                    <NavLink
                      className={styles.link}
                      to={route.path}
                      aria-label={route.toolTip}
                    >
                      <div className={styles.linkIconContainer}>
                        <Tooltip
                          content={route.toolTip}
                          relationship="description"
                        >
                          <i
                            className={
                              styles.linkIcon + ' codicon ' + route.iconClass
                            }
                          />
                        </Tooltip>
                      </div>
                      <span className="linkText">{route.name}</span>
                    </NavLink>
                  </div>
                )
              })}
          </div>
          <div className={styles.reset}>
            {Object.entries(routes).map(([key, route]) => {
              if (!route.siteNav || !route.footer) return
              if (!community?.isMaintainer && route.forAdmin) return
              return (
                <div key={key} className={styles.linkContainer}>
                  <NavLink
                    className={styles.link}
                    to={route.path}
                    aria-label={route.toolTip}
                  >
                    <div className={styles.linkIconContainer}>
                      <Tooltip
                        content={route.toolTip}
                        relationship="description"
                      >
                        <i
                          className={
                            styles.linkIcon + ' codicon ' + route.iconClass
                          }
                        />
                      </Tooltip>
                    </div>
                    <span className="linkText">{route.name}</span>
                  </NavLink>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
