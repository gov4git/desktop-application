import { Card } from '@fluentui/react-components'
import { FC, PropsWithChildren } from 'react'

import { useCardStyles } from './StyledCard.styles.js'

export const StyledCard: FC<PropsWithChildren> = function StyledCard({
  children,
}) {
  const styles = useCardStyles()

  return <Card className={styles.card}>{children}</Card>
}
