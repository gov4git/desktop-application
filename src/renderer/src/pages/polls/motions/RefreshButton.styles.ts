import { makeStyles, shorthands } from '@fluentui/react-components'

export const useRefreshButtonStyles = makeStyles({
  refreshButton: {
    fontSize: '1.5rem',
    position: 'absolute',
    right: '28px',
    top: '12px',
    'text-decoration': 'none',
    ...shorthands.padding(0),
    backgroundColor: 'transparent',
    ...shorthands.border('0'),
    ':hover': {
      cursor: 'pointer',
    },
  },
})
