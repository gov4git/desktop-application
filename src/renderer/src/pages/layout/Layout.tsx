import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { routes } from '../../App/Router.js'
import { Loader } from '../../components/index.js'
import {
  useCheckForUpdates,
  useGlobalSettingsErrors,
} from '../../store/hooks/globalHooks.js'
import { useDataStore } from '../../store/store.js'
import { ErrorScreen } from './ErrorScreen.js'
import { Header } from './Header.js'
import { useLayoutStyles } from './Layout.styles.js'
import { SiteNav } from './SiteNav.js'
import { UpdateNotification } from './UpdateNotification.js'

export const Layout = function Layout() {
  const classes = useLayoutStyles()
  const errorMessage = useDataStore((s) => s.error)
  const mainRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const settingsError = useGlobalSettingsErrors()
  const [loading, setLoading] = useState(false)
  const getUser = useDataStore((s) => s.userInfo.fetchUser)
  const getCommunities = useDataStore((s) => s.communityInfo.fetchCommunities)
  const checkForUpdates = useCheckForUpdates()

  useEffect(() => {
    if (errorMessage !== '') {
      if (mainRef.current != null) {
        mainRef.current.scrollTo(0, 0)
      }
    }
  }, [errorMessage])

  useEffect(() => {
    if (settingsError.length > 0) {
      navigate(routes.settings.path)
    }
  }, [navigate, settingsError])

  useLayoutEffect(() => {
    async function run() {
      setLoading(true)
      await Promise.allSettled([getUser(), getCommunities()])
      setLoading(false)
    }
    void run()
  }, [getUser, getCommunities, setLoading])

  useEffect(() => {
    void checkForUpdates()
    const checkForUpdatesInterval = setInterval(async () => {
      return await checkForUpdates()
    }, 60 * 1000)
    return () => {
      clearInterval(checkForUpdatesInterval)
    }
  }, [checkForUpdates])

  return (
    <div id="layout" className={classes.layout}>
      <Header className={classes.header} />
      <div className={classes.mainContainer}>
        <SiteNav />
        <main className={classes.main} ref={mainRef}>
          <ErrorScreen />
          <Loader isLoading={loading}>
            <Outlet />
          </Loader>
        </main>
        <UpdateNotification />
      </div>
    </div>
  )
}
