import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useButtonStyles = makeStyles({
  primary: {
    color: gov4GitTokens.g4gColorPrimary,
    ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorPrimary),
    backgroundColor: gov4GitTokens.g4gColorSecondary,
    opacity: '0.9',
    ':hover': {
      color: gov4GitTokens.g4gColorPrimary,
      ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorPrimary),
      backgroundColor: gov4GitTokens.g4gColorSecondary,
      opacity: '1',
    },
    ':disabled': {
      color: gov4GitTokens.g4gColorPrimary,
      ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorPrimary),
      backgroundColor: gov4GitTokens.g4gColorSecondary,
      opacity: '0.3',
      ':hover': {
        color: gov4GitTokens.g4gColorPrimary,
        ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorPrimary),
        backgroundColor: gov4GitTokens.g4gColorSecondary,
        opacity: '0.3',
      },
    },
  },
  link: {
    backgroundColor: 'transparent!important',
    ...shorthands.border('none'),
    color: '-webkit-link',
    ...shorthands.textDecoration('underline'),
    cursor: 'pointer',
  },
})
