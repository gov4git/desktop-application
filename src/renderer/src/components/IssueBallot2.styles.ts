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
    width: '250px',
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
  buttonArea: {
    height: '20px',
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
  issueLinkArea: {
    ...shorthands.padding('8px', 0, 0, 0),
  },
})
