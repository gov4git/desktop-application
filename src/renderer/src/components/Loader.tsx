import { Spinner } from '@fluentui/react-spinner'
import { useAtomValue } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

import { loaderAtom } from '../state/loader.js'

export const Loader: FC<PropsWithChildren> = function Loader({ children }) {
  const isLoading = useAtomValue(loaderAtom)

  if (isLoading) {
    return <Spinner />
  } else {
    return children
  }
}
