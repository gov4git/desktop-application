import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/tokens.js'

export const useBubbleSliderStyles = makeStyles({
  sliderArea: {
    position: 'relative',
    marginBottom: '36px',
  },
  slider: {
    display: 'block',
    appearance: 'none',
    height: '4px',
    width: '100%',
    backgroundColor: gov4GitTokens.g4gColorPrimaryGreen2,
    ...shorthands.outline('none'),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusLarge),
    '::-webkit-slider-thumb': {
      content: 'hello',
      appearance: 'none',
      backgroundColor: gov4GitTokens.g4gColorSecondaryGreen8,
      width: '20px',
      height: '16px',
      ...shorthands.borderRadius(gov4GitTokens.borderRadiusCircular),
      ...shorthands.border('2px', 'solid', gov4GitTokens.g4gColorNeutral),
    },
    ':disabled': {
      backgroundColor: gov4GitTokens.g4gColorNeutralDark,
      '::-webkit-slider-thumb': {
        backgroundColor: gov4GitTokens.colorNeutralForeground4,
      },
    },
  },
  bubble: {
    fontSize: '0.7rem',
    color: gov4GitTokens.g4gColorNeutral,
    backgroundColor: gov4GitTokens.g4gColorSecondaryGreen8,
    ...shorthands.padding('1px', '6px'),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusMedium),
    position: 'absolute',
    top: '0.8rem',
    transform: 'translateX(-50%)',
    '[aria-disabled]': {
      backgroundColor: gov4GitTokens.colorNeutralForeground4,
    },
  },
})
