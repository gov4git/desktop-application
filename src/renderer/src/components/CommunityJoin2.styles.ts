import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useCommunityJoinStyle = makeStyles({
  formRow: {
    display: 'flex',
    ...shorthands.gap('8px'),
    alignItems: 'center',
    ...shorthands.padding('8px', 0),
  },
  inputField: {
    flexGrow: 1,
  },
  card: {
    ...shorthands.padding(gov4GitTokens.spacingHorizontalXXL),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusLarge),
  },
  firstCol: {
    width: '50px',
  },
})
