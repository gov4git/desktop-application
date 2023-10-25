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
    paddingBottom: '2rem',
  },
  labelText: {
    fontSize: '1.25rem',
    display: 'block',
    ...shorthands.padding(0, 0, '0.5rem', 0),
  },
})
