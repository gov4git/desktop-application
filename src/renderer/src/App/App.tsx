import './App.css'

import { FluentProvider } from '@fluentui/react-components'

import { Router } from './Router.js'
import { gov4GitTheme } from './theme/theme.js'

export const App = function App() {
  return (
    <FluentProvider theme={gov4GitTheme} id="fluent-provider">
      <Router />
    </FluentProvider>
  )
}
