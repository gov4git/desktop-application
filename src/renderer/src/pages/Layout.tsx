import { useAtomValue } from 'jotai'
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
import { useLayoutStyles } from './Layout.styles.js'

export const Layout = function Layout() {
  const classes = useLayoutStyles()
  const errorMessage = useAtomValue(errorAtom)

  return (
    <div id="layout" className={classes.layout}>
      <Header className={classes.header} />
      <div className={classes.mainContainer}>
        <DataLoader />
        <SiteNav />
        <main className={classes.main}>
          {errorMessage !== '' && (
            <ErrorScreen message={errorMessage} showClose={true} />
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
