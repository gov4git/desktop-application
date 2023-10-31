import { makeStyles, shorthands } from '@fluentui/react-components'

export const userShowErrorStyles = makeStyles({
  close: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    fontSize: '1.25rem',
    'text-decoration': 'none',
    backgroundColor: 'transparent',
    ...shorthands.border('0'),
    ':hover': {
      cursor: 'pointer',
    },
  },
})
