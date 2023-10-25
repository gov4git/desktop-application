import { makeStyles, shorthands } from '@fluentui/react-components'

export const usePullRequestsStyles = makeStyles({
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    ...shorthands.padding(0, '4px', '4px', '4px'),
  },
})
