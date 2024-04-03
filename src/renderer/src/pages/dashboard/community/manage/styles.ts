import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../../../../App/theme/index.js'

export const useManageCommunityStyles = makeStyles({
  buttonRow: {
    display: 'flex',
    ...shorthands.gap('8px'),
    alignItems: 'center',
    ...shorthands.padding('8px', 0),
  },
  issueCreditsForm: {
    ...shorthands.padding('20px', 0, 0, 0),
  },
  selectedIssueArea: {
    ...shorthands.padding('20px', 0),
  },
  selectedRow: {
    backgroundColor: 'var(--colorSubtleBackgroundPressed)',
  },
  titleArea: {
    paddingBottom: '8px',
    '& h2': {
      paddingBottom: '4px',
    },
  },
  description: {
    '& ul': {
      ...shorthands.padding('10px', '20px'),
    },
    '& img': {
      ...shorthands.margin('20px'),
      ...shorthands.border('1px', 'solid', gov4GitTokens.g4gColorNeutralDarker),
      maxWidth: 'calc(100% - 20px)',
    },
    '& p': {
      ...shorthands.padding('12px', 0),
    },
  },
  tableArea: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  searchControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shorthands.gap('8px'),
  },
  searchBox: {
    flexGrow: 1,
    flexShrink: 1,
  },
  searchInput: {
    width: '100%',
    minWidth: '100%',
  },
  controlDropdown: {
    minWidth: '150px',
    maxWidth: '150px',
    width: '150px',
    '& .fui-Dropdown': {
      minWidth: '150px',
      maxWidth: '150px',
      width: '150px',
    },
  },
})
