import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

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
    ...shorthands.padding(
      gov4GitTokens.spacingVerticalL,
      gov4GitTokens.spacingHorizontalM,
    ),
    height: 'calc(100% - 60px)',
    overflowY: 'auto',
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: '100%',
    position: 'relative',
  },
})
