import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const userShowErrorStyles = makeStyles({
  error: {
    ...shorthands.padding(gov4GitTokens.spacingHorizontalXL),
    backgroundColor: gov4GitTokens.colorPaletteRedBackground1,
    ...shorthands.border('1px', 'solid', gov4GitTokens.colorPaletteRedBorder1),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusMedium),
    boxShadow: gov4GitTokens.shadow2,
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
})
