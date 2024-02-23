import { makeStyles, shorthands } from '@fluentui/react-components'

export const useMotionsControlStyles = makeStyles({
  container: {
    ...shorthands.padding('30px', '0'),
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shorthands.padding(0, '0', '8px', '0'),
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
