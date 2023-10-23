import { makeStyles, shorthands } from '@fluentui/react-components'

import { gov4GitTokens } from '../App/theme/index.js'

export const useSettingsFormsStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'space-evenly',
    ...shorthands.margin('1rem', '0'),
  },
  card: {
    ...shorthands.padding(gov4GitTokens.spacingHorizontalXXL),
    ...shorthands.borderRadius(gov4GitTokens.borderRadiusLarge),
  },
  field: {
    marginBottom: gov4GitTokens.spacingVerticalL,
  },
  labelText: {
    fontSize: '1.15rem',
  },
})
