import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useHeaderStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: gov4GitTokens.g4gColorPrimaryGreen8,
    color: gov4GitTokens.g4gColorNeutralLighter,
    height: '60px',
    boxShadow: gov4GitTokens.shadow8,
    ...shorthands.borderBottom(
      '1px',
      'solid',
      gov4GitTokens.g4gColorPrimaryGreen3,
    ),
  },
  logo: {
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
    marginLeft: '12px',
    ...shorthands.gap('8px'),
    '> img': {
      maxHeight: '1.8rem',
    },
  },
})
