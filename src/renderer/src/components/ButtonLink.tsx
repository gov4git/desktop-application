import { FC, PropsWithChildren } from 'react'

import { useButtonStyles } from '../styles/buttons.js'

export type ButtonLinkProps = {
  onClick: () => void | Promise<void>
}

export const ButtonLink: FC<PropsWithChildren<ButtonLinkProps>> =
  function ButtonLink({ onClick, children }) {
    const buttonStyles = useButtonStyles()
    return (
      <button className={buttonStyles.link} onClick={onClick}>
        {children}
      </button>
    )
  }
