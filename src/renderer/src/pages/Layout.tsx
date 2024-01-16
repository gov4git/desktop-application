import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'

import { ErrorScreen } from '../components/ErrorScreen.js'
import {
  DataLoader,
  Header,
  Loader,
  RefreshButton,
  SiteNav,
  UpdateNotification,
} from '../components/index.js'
import { errorAtom } from '../state/error.js'
import { loaderAtom } from '../state/loader.js'
import { useLayoutStyles } from './Layout.styles.js'

export const Layout = function Layout() {
  const classes = useLayoutStyles()
  const errorMessage = useAtomValue(errorAtom)
  const mainRef = useRef<HTMLElement>(null)
  const isLoading = useAtomValue(loaderAtom)

  useEffect(() => {
    if (errorMessage !== '') {
      if (mainRef.current != null) {
        mainRef.current.scrollTo(0, 0)
      }
    }
  }, [errorMessage])

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
            <RefreshButton />
            <Outlet />
          </Loader>
        </main>
        <UpdateNotification />
      </div>
    </div>
  )
}
