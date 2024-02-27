import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../../../../../App/theme/tokens.js'

export const useCommunityDeployStyle = makeStyles({
  firstCol: {
    width: '50px',
  },
  buttonRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shorthands.gap('16px'),
    ...shorthands.padding('8px', 0),
  },
  instructionTitle: {
    ...shorthands.padding('8px', 0),
  },
  instructionsList: {
    ...shorthands.padding('0', '18px'),
    '& li': {
      ...shorthands.padding('10px', 0, 0, '12px'),
    },
  },
  accessTable: {
    ...shorthands.margin('12px'),
    ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorNeutralDark),
    borderCollapse: 'collapse',
    '& th, & td': {
      ...shorthands.padding('8px', '12px'),
      ...shorthands.borderBottom(
        '1px',
        'solid',
        gov4GitTokens.g4gColorNeutralDark,
      ),
    },
  },
})
