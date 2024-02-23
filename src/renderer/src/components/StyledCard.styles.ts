import { makeStyles, shorthands } from '@fluentui/react-components'

export const useCardStyles = makeStyles({
  card: {
    ...shorthands.padding('32px'),
    ...shorthands.borderRadius('unset'),
    marginBottom: '32px',
  },
})
