import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../../../../../App/theme/tokens.js'

export const useManageCommunityOverviewStyles = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    ...shorthands.gap('16px', '28px'),
  },
  card: {
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusXLarge),
    boxShadow: gov4GitTokens.shadow16,
    ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorNeutralDark),
    ':hover': {
      boxShadow: gov4GitTokens.shadow28,
      backgroundColor: gov4GitTokens.g4gColorSecondaryGreen1,
      cursor: 'pointer',
    },
  },
})
