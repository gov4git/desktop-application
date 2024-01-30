import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../../App/theme/index.js'

export const useLicenseViewerStyles = makeStyles({
  root: {
    overflowY: 'scroll',
    ...shorthands.padding(gov4GitTokens.spacingVerticalM),
    ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorNeutralDark),
    '& p': {
      paddingBottom: gov4GitTokens.spacingVerticalM,
    },
  },
})
