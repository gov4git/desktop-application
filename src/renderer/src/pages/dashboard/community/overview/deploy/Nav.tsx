import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
} from '@fluentui/react-components'
import { FC, memo } from 'react'

import { useDataStore } from '../../../../../store/store.js'

export const Nav: FC = memo(function Nav() {
  const state = useDataStore((s) => s.communityDeploy.state)
  const setState = useDataStore((s) => s.communityDeploy.setState)

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
