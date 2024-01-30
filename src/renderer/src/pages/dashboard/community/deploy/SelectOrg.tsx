import {
  Button,
  Checkbox,
  MessageBar,
  MessageBarBody,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'
import { FC, memo, useCallback, useEffect, useState } from 'react'

import { Loader } from '../../../../components/Loader.js'
import { LoginVerification } from '../../../../components/LoginVerification.js'
import {
  useCommunityDeployFetchOrgs,
  useCommunityDeployOrg,
  useCommunityDeployOrgs,
  useSetCommunityDashboardState,
  useSetCommunityDeployOrg,
  useSetCommunityDeployState,
} from '../../../../store/hooks/communityHooks.js'
import { useStartLoginFlow } from '../../../../store/hooks/userHooks.js'
import { useButtonStyles } from '../../../../styles/index.js'
import { useCommunityDeployStyle } from './styles.js'

export const SelectOrg: FC = memo(function SelectOrg() {
  const buttonStyles = useButtonStyles()
  const orgs = useCommunityDeployOrgs()
  const getOrgs = useCommunityDeployFetchOrgs()
  const selectedOrg = useCommunityDeployOrg()
  const setSelectedOrg = useSetCommunityDeployOrg()
  const styles = useCommunityDeployStyle()
  const setCommunityDashboardState = useSetCommunityDashboardState()
  const setCommunityDeployState = useSetCommunityDeployState()
  const [dataLoading, setDataLoading] = useState(false)
  const [verification, setVerification] = useState<Verification | null>(null)
  const [vericationLoading, setVerificationLoading] = useState(false)
  const startLoginFlow = useStartLoginFlow()

  const loadData = useCallback(async () => {
    setDataLoading(true)
    await getOrgs()
    setDataLoading(false)
  }, [setDataLoading, getOrgs])

  const reauthorize = useCallback(async () => {
    setVerificationLoading(true)
    const verification = await startLoginFlow()
    setVerification(verification)
    setVerificationLoading(false)
  }, [startLoginFlow, setVerification, setVerificationLoading])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <>
      <MessageBar layout="multiline" intent="info">
        <MessageBarBody>
          Gov4Git communities can only be deployed for{' '}
          <a
            href="https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Organizations
          </a>
          . You must be an admin of an organization in order to deploy a Gov4Git
          community. Listed below are the organizations this app is authorized
          to access and in which you are an admin. If Organizations you wish to
          manage are missing from the list, you may{' '}
          <button className={buttonStyles.link} onClick={reauthorize}>
            Reauthorize
          </button>{' '}
          to grant this application access to additional organizations.
          <Loader isLoading={vericationLoading}>
            <LoginVerification
              verification={verification}
              onLoggedIn={loadData}
            />
          </Loader>
        </MessageBarBody>
      </MessageBar>
      <Loader isLoading={dataLoading}>
        {/* <h2>Deploy Community &gt; Select Organization</h2> */}
        {orgs != null && orgs.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className={styles.firstCol}></TableHeaderCell>
                <TableHeaderCell>GitHub Organizations</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((o) => (
                <TableRow key={o.organizationName}>
                  <TableCell className={styles.firstCol}>
                    <Checkbox
                      checked={o.organizationName === selectedOrg}
                      onChange={() => setSelectedOrg(o.organizationName)}
                    />
                  </TableCell>
                  <TableCell>{o.organizationName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className={styles.buttonRow}>
          <Button onClick={() => setCommunityDashboardState('initial')}>
            Cancel
          </Button>
          <Button
            disabled={selectedOrg === ''}
            appearance="primary"
            onClick={() => setCommunityDeployState('repo-select')}
          >
            Next
          </Button>
        </div>
      </Loader>
    </>
  )
})
