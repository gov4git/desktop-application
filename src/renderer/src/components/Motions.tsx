import { Card } from '@fluentui/react-components'
import { type FC, useEffect, useMemo } from 'react'

import { useCommunity } from '../store/hooks/communityHooks.js'
import {
  useFetchMotions,
  useMotions,
  useMotionsLoading,
  useMotionsSearchArgs,
  useSetMotionsLoading,
} from '../store/hooks/motionHooks.js'
import { useHeadingsStyles } from '../styles/headings.js'
import { Loader } from './Loader.js'
import { MotionsBallot } from './MotionsBallot.js'
import { MotionsControls } from './MotionsControls.js'
import { RefreshButton } from './RefreshButton.js'

export type MotionsProps = {
  title: string
}

export const Motions: FC<MotionsProps> = function Motions({ title }) {
  const motions = useMotions()
  const headingStyles = useHeadingsStyles()
  const community = useCommunity()
  const motionsLoading = useMotionsLoading()
  const setMotionsLoading = useSetMotionsLoading()
  const motionSearchArgs = useMotionsSearchArgs()
  const fetchMotions = useFetchMotions()

  const issuesLink = useMemo(() => {
    if (community == null) return null
    return `${community.projectUrl}/issues?q=is:open is:issue label:gov4git:managed`
  }, [community])

  useEffect(() => {
    async function run() {
      setMotionsLoading(true)
      await fetchMotions()
      setMotionsLoading(false)
    }
    void run()
  }, [setMotionsLoading, motionSearchArgs, fetchMotions])

  return (
    <>
      <RefreshButton />
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
