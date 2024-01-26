import { createHashRouter, RouterProvider } from 'react-router-dom'

import { RequireAuth } from '../components/RequireAuth.js'
import { AboutPage } from '../pages/About.js'
import { CommunityJoinPage } from '../pages/CommunityJoin.js'
import { DashboardPage } from '../pages/Dashboard.js'
import { ErrorPage } from '../pages/Error.js'
import { Layout } from '../pages/Layout.js'
import { LicensePage } from '../pages/License.js'
import { LoginPage } from '../pages/Login.js'
import { LogsPage } from '../pages/Logs.js'
import { PollsPage } from '../pages/Polls.js'

export type Route = {
  path: string
  name: string
  siteNav: boolean
  iconClass: string
  forAdmin: boolean
  toolTip: string
  footer: boolean
}

export type Routes = {
  issues: Route
  pullRequests: Route
  info: Route
  settings: Route
  login: Route
  communityJoin: Route
  license: Route
  logs: Route
}

export const routes = {
  issues: {
    index: true,
    name: 'Prioritization',
    path: '/',
    siteNav: true,
    forAdmin: false,
    iconClass: 'codicon-feedback',
    toolTip: 'Prioritize issues',
    footer: false,
    element: (
      <RequireAuth>
        <PollsPage state="ISSUES" />
      </RequireAuth>
    ),
  },
  pullRequests: {
    path: '/changes',
    name: 'Request for Changes',
    siteNav: true,
    forAdmin: false,
    iconClass: 'codicon-request-changes',
    footer: false,
    toolTip: 'Vote on changes',
    element: (
      <RequireAuth>
        <PollsPage state="PULL_REQUESTS" />
      </RequireAuth>
    ),
  },
  info: {
    path: '/about',
    name: 'About',
    siteNav: true,
    forAdmin: false,
    iconClass: 'codicon-info',
    footer: true,
    toolTip: 'About Gov4Git',
    element: <AboutPage />,
  },
  logs: {
    path: '/logs',
    name: 'Logs',
    siteNav: false,
    forAdmin: false,
    iconClass: '',
    footer: false,
    toolTip: '',
    element: (
      <RequireAuth>
        <LogsPage />
      </RequireAuth>
    ),
  },
  settings: {
    path: '/dashboard',
    name: 'Settings',
    siteNav: true,
    forAdmin: false,
    iconClass: 'codicon-settings-gear',
    footer: true,
    toolTip: 'Settings',
    element: <DashboardPage />,
  },
  login: {
    path: '/login',
    name: 'Login',
    siteNav: false,
    forAdmin: false,
    iconClass: '',
    footer: false,
    toolTip: '',
    element: <LoginPage />,
  },
  communityJoin: {
    path: '/community-join',
    name: 'Community Join',
    siteNav: false,
    forAdmin: false,
    iconClass: '',
    footer: false,
    toolTip: '',
    element: <CommunityJoinPage />,
  },
  license: {
    path: '/license',
    name: 'License',
    siteNav: false,
    forAdmin: false,
    iconClass: '',
    footer: false,
    toolTip: '',
    element: <LicensePage />,
  },
} as Routes

const pages = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: Object.values(routes),
  },
]

const router = createHashRouter(pages)

export const Router = function Router() {
  return <RouterProvider router={router} />
}
