import { makeStyles, shorthands } from '@fluentui/react-components'

export const useCommunityOverviewStyles = makeStyles({
  container: {
    display: 'grid',
    ...shorthands.gap('28px'),
  },
  buttonRow: {
    display: 'flex',
    ...shorthands.gap('16px'),
    alignItems: 'center',
  },
})
