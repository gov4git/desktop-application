import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
} from '@fluentui/react-components'
import { FC, memo } from 'react'

import {
  useCommunityDeployState,
  useSetCommunityDeployState,
} from '../../../../store/hooks/communityHooks.js'

export const Nav: FC = memo(function Nav() {
  const state = useCommunityDeployState()
  const setState = useSetCommunityDeployState()

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbButton onClick={() => setState('initial')}>
          Select Organization
        </BreadcrumbButton>
      </BreadcrumbItem>
      {['repo-select', 'provide-token', 'deploy'].includes(state) && (
        <>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton onClick={() => setState('repo-select')}>
              Select Repo
            </BreadcrumbButton>
          </BreadcrumbItem>
        </>
      )}
      {['provide-token', 'deploy'].includes(state) && (
        <>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton onClick={() => setState('provide-token')}>
              PAT
            </BreadcrumbButton>
          </BreadcrumbItem>
        </>
      )}
      {['deploy'].includes(state) && (
        <>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton onClick={() => setState('deploy')}>
              Deploy
            </BreadcrumbButton>
          </BreadcrumbItem>
        </>
      )}
    </Breadcrumb>
  )
})
