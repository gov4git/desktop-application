import { makeStyles, shorthands } from '@fluentui/react-components'

export const useDashboardCommunityStyle = makeStyles({
  buttonRow: {
    display: 'flex',
    ...shorthands.gap('8px'),
    alignItems: 'center',
  },
})
