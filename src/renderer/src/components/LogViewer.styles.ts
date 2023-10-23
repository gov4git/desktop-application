import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useLogViewerStyles = makeStyles({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    // ...shorthands.padding(gov4GitTokens.spacingVerticalM),
    ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorNeutralDark),
  },
  header: {
    flexGrow: '0',
    flexShrink: '0',
    ...shorthands.padding(gov4GitTokens.spacingVerticalM),
    ...shorthands.borderBottom(
      '1px',
      'solid',
      gov4GitTokens.g4gColorNeutralDarker,
    ),
  },
  contents: {
    ...shorthands.padding(gov4GitTokens.spacingVerticalM),
    flexGrow: '0',
    flexShrink: '0',
    flexBasis: 'auto',
    width: '100%',
    overflowX: 'scroll',
    overflowY: 'scroll',
    whiteSpaceCollapse: 'preserve',
  },
  icon: {
    ...shorthands.padding('0', gov4GitTokens.spacingHorizontalS, '0', '0'),
  },
})
