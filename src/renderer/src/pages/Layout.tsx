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
import { eventBus } from '../lib/index.js'
import { errorAtom } from '../state/error.js'
import { useLayoutStyles } from './Layout.styles.js'

export const Layout = function Layout() {
  const classes = useLayoutStyles()
  const errorMessage = useAtomValue(errorAtom)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    return eventBus.subscribe('error', () => {
      if (mainRef.current != null) {
        mainRef.current.scrollTo(0, 0)
      }
    })
  }, [mainRef])

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
          <Loader>
            <RefreshButton />
            <Outlet />
          </Loader>
        </main>
        <UpdateNotification />
      </div>
    </div>
  )
}
