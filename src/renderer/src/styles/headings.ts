import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useHeadingsStyles = makeStyles({
  pageHeading: {
    ...shorthands.padding('0.4rem', 0, '2rem', 0),
    fontSize: '2rem',
    color: gov4GitTokens.g4gColorNeutralDarkest,
    textShadow: '0px 1px 0px #FFFFFF',
  },
})
