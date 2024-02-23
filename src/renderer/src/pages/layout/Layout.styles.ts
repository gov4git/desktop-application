import { makeStyles, shorthands } from '@fluentui/react-components'

export const useLayoutStyles = makeStyles({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    overflowY: 'hidden',
  },
  header: {
    flexGrow: 0,
    flexShrink: 0,
  },
  mainContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    height: '100%',
    overflowY: 'hidden',
  },
  main: {
    ...shorthands.padding('28px', '28px', '28px', '28px'),
    height: 'calc(100% - 60px)',
    overflowY: 'auto',
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: '100%',
    position: 'relative',
  },
})
