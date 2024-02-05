import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../../App/theme/index.js'

export const useExceptionPanelStyles = makeStyles({
  root: {
    ...shorthands.padding('36px', 0),
  },
  card: {
    position: 'relative',
    ...shorthands.padding(gov4GitTokens.spacingHorizontalXXL),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusLarge),
  },
  close: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '1.25rem',
    'text-decoration': 'none',
    backgroundColor: 'transparent',
    ...shorthands.border('0'),
    ':hover': {
      cursor: 'pointer',
    },
  },
  messageContainer: {
    display: 'block',
  },
})
