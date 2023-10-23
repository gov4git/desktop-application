import type { Theme } from '@fluentui/react-components'
import { webLightTheme } from '@fluentui/react-components'

import type { Expand } from '~/shared'

export type Gov4GitTheme = Expand<
  Theme & {
    g4gColorPrimary: string
    g4gColorSecondary: string
    g4gColorNeutralDarkest: string
    g4gColorNeutralDarker: string
    g4gColorNeutralDark: string
    g4gColorNeutral: string
    g4gColorNeutralLight: string
    g4gColorNeutralLighter: string
    g4gColorPrimaryGreen1: string
    g4gColorPrimaryGreen2: string
    g4gColorPrimaryGreen3: string
    g4gColorPrimaryGreen4: string
    g4gColorPrimaryGreen5: string
    g4gColorPrimaryGreen6: string
    g4gColorPrimaryGreen7: string
    g4gColorPrimaryGreen8: string
    g4gColorPrimaryGreen9: string
    g4gColorSecondaryGreen1: string
    g4gColorSecondaryGreen2: string
    g4gColorSecondaryGreen3: string
    g4gColorSecondaryGreen4: string
    g4gColorSecondaryGreen5: string
    g4gColorSecondaryGreen6: string
    g4gColorSecondaryGreen7: string
    g4gColorSecondaryGreen8: string
    g4gColorSecondaryGreen9: string
  }
>

export const gov4GitTheme: Gov4GitTheme = {
  ...webLightTheme,
  g4gColorPrimary: '#1A271D',
  g4gColorSecondary: '#D7E5D4',
  g4gColorNeutralDarkest: '#000000',
  g4gColorNeutralDarker: '#D6D6D6',
  g4gColorNeutralDark: '#E4E4E4',
  g4gColorNeutral: '#F3F4F4',
  g4gColorNeutralLight: '#F3F3F3',
  g4gColorNeutralLighter: '#FFFFFF',
  g4gColorPrimaryGreen1: '#EEF0EE',
  g4gColorPrimaryGreen2: '#CCD3CD',
  g4gColorPrimaryGreen3: '#A1B0A5',
  g4gColorPrimaryGreen4: '#6F8574',
  g4gColorPrimaryGreen5: '#475D4C',
  g4gColorPrimaryGreen6: '#2F4634',
  g4gColorPrimaryGreen7: '#1B3521',
  g4gColorPrimaryGreen8: '#14301B',
  g4gColorPrimaryGreen9: '#0B2612',
  g4gColorSecondaryGreen1: '#D6E4D2',
  g4gColorSecondaryGreen2: '#C9E1C2',
  g4gColorSecondaryGreen3: '#B9DFB1',
  g4gColorSecondaryGreen4: '#9CD68F',
  g4gColorSecondaryGreen5: '#69C654',
  g4gColorSecondaryGreen6: '#45B02D',
  g4gColorSecondaryGreen7: '#34911F',
  g4gColorSecondaryGreen8: '#1E670E',
  g4gColorSecondaryGreen9: '#0F4204',
}
