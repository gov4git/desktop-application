import { useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { routes } from '../../App/Router.js'
import { Loader } from '../../components/index.js'
import {
  useGlobalError,
  useGlobalLoading,
  useGlobalSettingsErrors,
} from '../../store/hooks/globalHooks.js'
import { DataLoader } from './DataLoader.js'
import { ErrorScreen } from './ErrorScreen.js'
import { Header } from './Header.js'
import { useLayoutStyles } from './Layout.styles.js'
import { SiteNav } from './SiteNav.js'
import { UpdateNotification } from './UpdateNotification.js'

export const Layout = function Layout() {
  const classes = useLayoutStyles()
  const errorMessage = useGlobalError()
  const mainRef = useRef<HTMLElement>(null)
  const isLoading = useGlobalLoading()
  const navigate = useNavigate()
  const settingsError = useGlobalSettingsErrors()

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

  return (
    <div id="layout" className={classes.layout}>
      <Header className={classes.header} />
      <div className={classes.mainContainer}>
        <DataLoader />
        <SiteNav />
        <main className={classes.main} ref={mainRef}>
          {errorMessage !== '' && (
            <>
              <br />
              <br />
              <ErrorScreen message={errorMessage} showClose={true} />
            </>
          )}
          <Loader isLoading={isLoading}>
            <Outlet />
          </Loader>
        </main>
        <UpdateNotification />
      </div>
    </div>
  )
}
