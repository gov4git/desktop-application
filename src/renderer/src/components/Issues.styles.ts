import { makeStyles, shorthands } from '@fluentui/react-components'

export const useIssuesStyles = makeStyles({
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.padding(0, '4px', '4px', '4px'),
  },
})
