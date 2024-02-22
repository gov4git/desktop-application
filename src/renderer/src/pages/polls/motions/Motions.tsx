import { Card } from '@fluentui/react-components'
import { type FC, useEffect, useMemo, useState } from 'react'

import { Loader } from '../../../components/index.js'
import { useDataStore } from '../../../store/store.js'
import { useHeadingsStyles } from '../../../styles/headings.js'
import { MotionsBallot } from './MotionsBallot.js'
import { MotionsControls } from './MotionsControls.js'
import { RefreshButton } from './RefreshButton.js'

export type MotionsProps = {
  title: string
  motionType: 'concern' | 'proposal'
}

export const Motions: FC<MotionsProps> = function Motions({
  title,
  motionType,
}) {
  const motions = useDataStore((s) => s.motionInfo.motions)
  const headingStyles = useHeadingsStyles()
  const community = useDataStore((s) => s.communityInfo.selectedCommunity)
  const [motionsLoading, setMotionsLoading] = useState(false)
  const motionSearchArgs = useDataStore((s) => s.motionInfo.searchArgs)
  const fetchMotions = useDataStore((s) => s.motionInfo.fetchMotions)

  const issuesLink = useMemo(() => {
    if (community == null) return null
    const resource = motionType === 'concern' ? 'issues' : 'pulls'
    const isOf = motionType === 'concern' ? 'issue' : 'pr'
    return `${community.projectUrl}/${resource}?q=is:open is:${isOf} label:gov4git:managed,gov4git:pmp-v1`
  }, [community, motionType])

  useEffect(() => {
    let shouldUpdate = true
    async function run() {
      setMotionsLoading(true)
      await fetchMotions(motionSearchArgs, false, () => shouldUpdate)
      setMotionsLoading(false)
    }
    void run()
    return () => {
      shouldUpdate = false
    }
  }, [setMotionsLoading, motionSearchArgs, fetchMotions])

  return (
    <>
      <RefreshButton onLoadingChange={setMotionsLoading} />
      <h1 className={headingStyles.pageHeading}>{title}</h1>

      <MotionsControls>
        {issuesLink != null && (
          <a href={issuesLink} target="_blank" rel="noreferrer">
            View all {motionType === 'concern' ? 'issues' : 'pull requests'} in
            GitHub
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
