import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useSiteNavStyles = makeStyles({
  navContainer: {
    '&.pinned': {
      width: '250px',
      ...shorthands.transition([['width', '400ms', '0s']]),
    },
    ...shorthands.transition([['width', '400ms', '0s']]),
    position: 'sticky',
    top: '0',
    width: '75px',
    height: 'calc(100vh - 60px)',
    zIndex: '100',
    flexBasis: 'auto',
    flexGrow: '0',
    flexShrink: '0',
  },
  relativeContainer: {
    position: 'relative',
    minHeight: '100%',
    width: '100%',
  },
  absoluteContainer: {
    backgroundColor: gov4GitTokens.colorNeutralBackground1,
    position: 'absolute',
    top: '0',
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflowX: 'hidden',
    // ...shorthands.transition('width', '600ms', '0', 'ease'),
    ...shorthands.borderRight(
      '1px',
      'solid',
      gov4GitTokens.g4gColorNeutralDark,
    ),
    boxShadow: gov4GitTokens.shadow2,
    '> .linkText': {
      width: '0',
      opacity: '0',
      overflowX: 'hidden',
    },
    '&.pinned': {
      // width: '250px',
      [`> .linkText`]: {
        ...shorthands.transition([
          ['width', '0s', '400ms'],
          ['display', '0s', '400ms'],
          ['opacity', '50ms', '400ms', 'linear'],
        ]),
        width: 'auto',
        opacity: '1',
      },
    },
  },
  reset: {
    width: '100%',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
  },
  expandContainer: {
    width: '100%',
    marginBottom: gov4GitTokens.spacingVerticalM,
  },
  epandLink: {
    width: '100%',
    color: gov4GitTokens.g4gColorPrimaryGreen4,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    'text-decoration': 'none',
    backgroundColor: 'transparent',
    ...shorthands.border('0'),
    ':hover': {
      cursor: 'pointer',
    },
  },
  linkContainer: {
    width: '100%',
  },
  link: {
    width: '100%',
    color: gov4GitTokens.g4gColorPrimaryGreen5,
    display: 'flex',
    alignItems: 'center',
    'text-decoration': 'none',
    ':hover, &.active': {
      backgroundColor: gov4GitTokens.g4gColorSecondaryGreen1,
      color: gov4GitTokens.g4gColorPrimaryGreen9,
    },
  },
  linkIconContainer: {
    width: '75px',
    minWidth: '75px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkIcon: {
    fontSize: gov4GitTokens.fontSizeBase600,
    '&.pinned': {
      transform: 'rotate(-180deg)',
    },
    ...shorthands.transition('all', '400ms'),
  },
})
