import { SettingsForm } from '../components/index.js'
import { useLoginStyles } from './Login.styles.js'

export const LoginPage = function LoginPage() {
  const classes = useLoginStyles()

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <SettingsForm />
      </div>
    </div>
  )
}
