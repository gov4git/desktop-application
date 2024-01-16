import { Spinner } from '@fluentui/react-spinner'
import type { FC, PropsWithChildren } from 'react'

export type LoaderProps = {
  isLoading: boolean
}

export const Loader: FC<PropsWithChildren<LoaderProps>> = function Loader({
  children,
  isLoading,
}) {
  if (isLoading) {
    return <Spinner />
  } else {
    return children
  }
}
