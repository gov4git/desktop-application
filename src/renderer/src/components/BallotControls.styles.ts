import { makeStyles, shorthands } from '@fluentui/react-components'

export const useBallotControlStyles = makeStyles({
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shorthands.padding(0, '4px', '12px', '4px'),
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
