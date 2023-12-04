import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/tokens.js'

export const useLoginStyles = makeStyles({
  title: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.padding('0.4rem', 0, '2rem', 0),
    ...shorthands.gap('12px'),
  },
  pageHeading: {
    ...shorthands.padding(0, 0, '2px', 0),
    fontSize: '2rem',
    color: gov4GitTokens.g4gColorNeutralDarkest,
    textShadow: '0px 1px 0px #FFFFFF',
  },
})
