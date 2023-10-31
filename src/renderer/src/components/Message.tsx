import type { FC } from 'react'

import { userShowErrorStyles } from './Message.styles.js'

export type ShowErrorProps = {
  messages: string[]
  onClose?: () => void
  className?: string
}

export const Message: FC<ShowErrorProps> = function Message({
  messages,
  // eslint-disable-next-line
  onClose = () => {},
  className,
}) {
  const styles = userShowErrorStyles()
  return (
    <div className={className}>
      <button title="close errors" className={styles.close} onClick={onClose}>
        <i className="codicon codicon-chrome-close" />
      </button>
      {messages.map((m) => {
        return <p key={m}>{m}</p>
      })}
    </div>
  )
}
