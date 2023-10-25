import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useLayoutStyles = makeStyles({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    width: '100%',
  },
  header: {
    flexGrow: 0,
    flexShrink: 0,
  },
  mainContainer: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
  },
  main: {
    ...shorthands.padding(
      gov4GitTokens.spacingVerticalL,
      gov4GitTokens.spacingHorizontalM,
    ),
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    position: 'relative',
  },
})
