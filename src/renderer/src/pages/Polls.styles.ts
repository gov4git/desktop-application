import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const usePollsStyles = makeStyles({
  buttonBar: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.gap(gov4GitTokens.spacingHorizontalM),
    ...shorthands.padding(gov4GitTokens.spacingVerticalL, 0),
  },
})
