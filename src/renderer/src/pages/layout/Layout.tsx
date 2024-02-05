import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { serialAsync } from '~/shared'

import { routes } from '../../App/Router.js'
import { Loader } from '../../components/index.js'
import {
  useCheckForUpdates,
  useGlobalSettingsErrors,
} from '../../store/hooks/globalHooks.js'
import { useDataStore } from '../../store/store.js'
import { ErrorPanel } from './ErrorPanel.js'
import { ExceptionPanel } from './ExceptionPanel.js'
import { Header } from './Header.js'
import { useLayoutStyles } from './Layout.styles.js'
import { SiteNav } from './SiteNav.js'
import { UpdateNotification } from './UpdateNotification.js'

export const Layout = function Layout() {
  const classes = useLayoutStyles()
  const exceptionMessage = useDataStore((s) => s.exception)
  const error = useDataStore((s) => s.error)
  const mainRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const settingsError = useGlobalSettingsErrors()
  const [loading, setLoading] = useState(false)
  const getUser = useDataStore((s) => s.userInfo.fetchUser)
  const getCommunities = useDataStore((s) => s.communityInfo.fetchCommunities)
  const checkForUpdates = useCheckForUpdates()
  const refreshCache = useDataStore((s) => s.refreshCache)

  useEffect(() => {
    if (exceptionMessage !== '') {
      if (mainRef.current != null) {
        mainRef.current.scrollTo(0, 0)
      }
    }
  }, [exceptionMessage])

  useEffect(() => {
    if (error != null) {
      if (mainRef.current != null) {
        mainRef.current.scrollTo(0, 0)
      }
    }
  }, [error])

  useEffect(() => {
    if (settingsError.length > 0) {
      navigate(routes.settings.path)
    }
  }, [navigate, settingsError])

  useEffect(() => {
    async function run() {
      setLoading(true)
      await Promise.allSettled([getUser(), getCommunities()])
      setLoading(false)
    }
    void run()
  }, [getUser, getCommunities, setLoading])

  useEffect(() => {
    void refreshCache()
    const updateCacheInterval = setInterval(
      serialAsync(async () => {
        await refreshCache()
      }),
      60 * 1000,
    )
    return () => {
      clearInterval(updateCacheInterval)
    }
  }, [refreshCache])

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
          <ErrorPanel />
          <ExceptionPanel />
          <Loader isLoading={loading}>
            <Outlet />
          </Loader>
        </main>
        <UpdateNotification />
      </div>
    </div>
  )
}
