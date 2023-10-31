import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useMessageStyles = makeStyles({
  error: {
    ...shorthands.padding('28px', gov4GitTokens.spacingHorizontalXL),
    backgroundColor: gov4GitTokens.colorPaletteRedBackground1,
    ...shorthands.border('1px', 'solid', gov4GitTokens.colorPaletteRedBorder1),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusMedium),
    boxShadow: gov4GitTokens.shadow2,
    position: 'relative',
  },
  success: {
    ...shorthands.padding('28px', gov4GitTokens.spacingHorizontalXL),
    backgroundColor: gov4GitTokens.g4gColorSecondaryGreen1,
    ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorSecondaryGreen8),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusMedium),
    boxShadow: gov4GitTokens.shadow2,
    position: 'relative',
  },
})
