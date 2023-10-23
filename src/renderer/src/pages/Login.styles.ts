import { makeStyles } from '@fluentui/react-components'

export const useLoginStyles = makeStyles({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
})
