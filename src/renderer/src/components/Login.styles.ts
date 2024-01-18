import { makeStyles, shorthands } from '@fluentui/react-components'

export const useLoginStyles2 = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  logoutArea: {
    ...shorthands.padding('12px', 0),
    fontSize: '1.1rem',
  },
  verificationArea: {
    fontSize: '1.1rem',
  },
})
