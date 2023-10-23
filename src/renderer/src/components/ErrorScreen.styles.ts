import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useErrorScreenStyles = makeStyles({
  root: {
    ...shorthands.padding(gov4GitTokens.spacingVerticalM),
    flexBasis: 'auto',
    width: '100%',
  },
  card: {
    position: 'relative',
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
