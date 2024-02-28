import { makeStyles, shorthands } from '@fluentui/react-components'

export const useJoinCommunityStyles = makeStyles({
  formRow: {
    display: 'flex',
    ...shorthands.gap('8px'),
    alignItems: 'center',
    ...shorthands.padding('20px', 0, 0, 0),
  },
  inputField: {
    flexGrow: 1,
  },
  firstCol: {
    width: '50px',
  },
})
