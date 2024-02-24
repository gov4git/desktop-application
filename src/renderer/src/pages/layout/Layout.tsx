import { useEffect, useMemo, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { routes } from '../../App/Router.js'
import { Loader } from '../../components/Loader.js'
import { useGlobalSettingsErrors } from '../../store/hooks/globalHooks.js'
import { useDataStore } from '../../store/store.js'
import { DataLoader } from './DataLoader.js'
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
  const userLoaded = useDataStore((s) => s.userInfo.userLoaded)

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

  return (
    <div id="layout" className={classes.layout}>
      <DataLoader />
      <Header className={classes.header} />
      <div className={classes.mainContainer}>
        <SiteNav />
        <main className={classes.main} ref={mainRef}>
          <ErrorPanel />
          <ExceptionPanel />
          <Loader isLoading={!userLoaded}>
            <Outlet />
          </Loader>
        </main>
        <UpdateNotification />
      </div>
    </div>
  )
}
