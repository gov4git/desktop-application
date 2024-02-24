import { Spinner } from '@fluentui/react-spinner'
import type { FC, PropsWithChildren } from 'react'

export type LoaderProps = {
  isLoading: boolean
  size?:
    | 'extra-tiny'
    | 'tiny'
    | 'extra-small'
    | 'small'
    | 'medium'
    | 'large'
    | 'extra-large'
    | 'huge'
}

export const Loader: FC<PropsWithChildren<LoaderProps>> = function Loader({
  children,
  isLoading,
  size = 'medium',
}) {
  if (isLoading) {
    return <Spinner size={size} />
  } else {
    return children
  }
}
