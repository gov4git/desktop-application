import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useIssueBallotStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  title: {
    paddingBottom: gov4GitTokens.spacingVerticalXL,
  },
  card: {
    marginBottom: '1rem',
  },
  description: {
    '& ul': {
      ...shorthands.padding('10px', '20px'),
    },
    '& img': {
      ...shorthands.margin('20px'),
      ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorNeutralDarker),
    },
  },
  votingArea: {
    width: '220px',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    fontSize: '1.3rem',
    ...shorthands.padding(gov4GitTokens.spacingHorizontalM),
  },
  sliderArea: {
    position: 'relative',
    marginBottom: '36px',
    // display: 'flex',
    // alignItems: 'center',
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
  },
  buttonArea: {
    height: '20px',
  },
  slider: {
    display: 'block',
    appearance: 'none',
    height: '4px',
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
  },
  issueArea: {
    flexGrow: '2',
    flexShrink: '1',
  },
  up: {
    color: gov4GitTokens.g4gColorSecondaryGreen7,
  },
  down: {
    color: gov4GitTokens.colorPaletteRedForeground1,
  },
})
