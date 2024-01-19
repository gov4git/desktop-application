import { Card } from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { type FC, useMemo } from 'react'

import { communityAtom } from '../state/community.js'
import { motionsAtom, motionsLoadingAton } from '../state/motions.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { Loader } from './Loader.js'
import { MotionsBallot } from './MotionsBallot.js'
import { MotionsControls } from './MotionsControls.js'

export type MotionsProps = {
  title: string
}

export const Motions: FC<MotionsProps> = function Motions({ title }) {
  const motions = useAtomValue(motionsAtom)
  const headingStyles = useHeadingsStyles()
  const community = useAtomValue(communityAtom)
  const motionsLoading = useAtomValue(motionsLoadingAton)

  const issuesLink = useMemo(() => {
    if (community == null) return null
    return `${community.projectUrl}/issues?q=is:open is:issue label:gov4git:managed`
  }, [community])

  return (
    <>
      <h1 className={headingStyles.pageHeading}>{title}</h1>

      <MotionsControls>
        {issuesLink != null && (
          <a href={issuesLink} target="_blank" rel="noreferrer">
            View all issues in GitHub
          </a>
        )}
      </MotionsControls>

      <Loader isLoading={motionsLoading}>
        {(motions == null || motions.length === 0) && (
          <Card>
            <p>No matching ballots to display at this time.</p>
          </Card>
        )}
        {motions != null &&
          motions.map((motion) => {
            return <MotionsBallot key={motion.motionId} motion={motion} />
          })}
      </Loader>
    </>
  )
}
