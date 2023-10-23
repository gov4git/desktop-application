import type { FC } from 'react'

import { userShowErrorStyles } from './Error.styles.js'

export type ShowErrorProps = {
  messages: string[]
  onClose?: () => void
}

export const ShowError: FC<ShowErrorProps> = function ShowError({
  messages,
  // eslint-disable-next-line
  onClose = () => {},
}) {
  const styles = userShowErrorStyles()
  return (
    <div className={styles.error}>
      <button title="close errors" className={styles.close} onClick={onClose}>
        <i className="codicon codicon-chrome-close" />
      </button>
      {messages.map((m) => {
        return <p key={m}>{m}</p>
      })}
    </div>
  )
}
