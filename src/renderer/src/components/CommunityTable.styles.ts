import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useCommunityTableStyle = makeStyles({
  formRow: {
    display: 'flex',
    ...shorthands.gap('12px'),
    alignItems: 'flex-end',
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
