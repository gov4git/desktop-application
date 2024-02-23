import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
} from '@fluentui/react-components'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Community } from '../../../../../electron/db/schema.js'
import { routes } from '../../../App/Router.js'
import { Loader, StyledCard } from '../../../components/index.js'
import { useDataStore } from '../../../store/store.js'
import { useMotionStyles } from './Motions.styles.js'
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
  const styles = useMotionStyles()
  const motions = useDataStore((s) => s.motionInfo.motions)
  const communities = useDataStore((s) => s.communityInfo.communities)
  const community = useDataStore((s) => s.communityInfo.selectedCommunity)
  const selectCommunity = useDataStore((s) => s.communityInfo.selectCommunity)
  const [motionsLoading, setMotionsLoading] = useState(false)
  const motionSearchArgs = useDataStore((s) => s.motionInfo.searchArgs)
  const fetchMotions = useDataStore((s) => s.motionInfo.fetchMotions)
  const navigate = useNavigate()

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

  const changeCommunity = useCallback(
    async (c: Community) => {
      if (c.url !== community?.url) {
        await selectCommunity(c.url)
      }
    },
    [community, selectCommunity],
  )

  const changePage = useCallback(
    (route: string) => {
      navigate(route)
    },
    [navigate],
  )

  return (
    <>
      <div className={styles.breadcrumbArea}>
        <Breadcrumb aria-label="Navigation" size="large">
          <BreadcrumbItem>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <BreadcrumbButton>{community?.name}</BreadcrumbButton>
              </MenuTrigger>

              <MenuPopover>
                <MenuList>
                  {communities.map((c) => (
                    <MenuItem key={c.url} onClick={() => changeCommunity(c)}>
                      {c.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <BreadcrumbButton>
                  <Text weight="bold" size={400}>
                    {motionType === 'concern'
                      ? 'Prioritize Issues'
                      : 'Prioritize Pull Requests'}
                  </Text>
                </BreadcrumbButton>
              </MenuTrigger>

              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={() => changePage(routes.issues.path)}>
                    Prioritize Issues
                  </MenuItem>
                  <MenuItem
                    onClick={() => changePage(routes.pullRequests.path)}
                  >
                    Prioritize Pull Requests
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      <RefreshButton onLoadingChange={setMotionsLoading} />
      {/* <h1 className={headingStyles.pageHeading}>{title}</h1> */}

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
          <StyledCard>
            <p>No matching ballots to display at this time.</p>
          </StyledCard>
        )}
        {motions != null &&
          motions.map((motion) => {
            return <MotionsBallot key={motion.motionId} motion={motion} />
          })}
      </Loader>
    </>
  )
}
