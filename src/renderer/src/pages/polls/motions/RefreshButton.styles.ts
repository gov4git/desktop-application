import { makeStyles, shorthands } from '@fluentui/react-components'

export const useRefreshButtonStyles = makeStyles({
  refreshButton: {
    fontSize: '1.5rem',
    position: 'absolute',
    right: '20px',
    top: '20px',
    'text-decoration': 'none',
    ...shorthands.padding(0),
    backgroundColor: 'transparent',
    ...shorthands.border('0'),
    ':hover': {
      cursor: 'pointer',
    },
  },
})
