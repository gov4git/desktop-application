import { makeStyles, shorthands } from '@fluentui/react-components'

export const useLoginVerificationStyle = makeStyles({
  verificationArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...shorthands.gap('12px'),
    fontSize: '1.1rem',
    ...shorthands.padding('12px', 0),
  },
})
