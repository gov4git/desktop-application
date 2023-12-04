import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useLoginStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  card: {
    ...shorthands.padding(gov4GitTokens.spacingHorizontalXXL),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusLarge),
  },
  field: {
    paddingBottom: '2rem',
  },
  labelText: {
    fontSize: '1.25rem',
    display: 'block',
    ...shorthands.padding(0, 0, '0.5rem', 0),
  },
})
