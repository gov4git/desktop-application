import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { FC, memo } from 'react'

import { Loader } from '../../../../components/Loader.js'
import { useDataStore } from '../../../../store/store.js'
import { useCommunityDeployStyle } from './styles.js'

export const SelectRepo: FC = memo(function SelectRepo() {
  const selectedOrg = useDataStore((s) => s.communityDeploy.selectedOrg)
  const selectedRepo = useDataStore((s) => s.communityDeploy.selectedRepo)
  const setSelectedRepo = useDataStore((s) => s.communityDeploy.setRepo)
  const repos = useDataStore((s) => s.communityDeploy.repos)
  const styles = useCommunityDeployStyle()
  const setCommunityDeployState = useDataStore(
    (s) => s.communityDeploy.setState,
  )

  return (
    <>
      <Loader isLoading={repos == null}>
        {/* <h2>Deploy Community &gt; {selectedOrg} &gt; Select Repo</h2> */}
        {repos != null && repos.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className={styles.firstCol}></TableHeaderCell>
                <TableHeaderCell>
                  Public GitHub Repos in {selectedOrg}
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repos.map((r) => (
                <TableRow key={r}>
                  <TableCell className={styles.firstCol}>
                    <Checkbox
                      checked={r === selectedRepo}
                      onChange={() => setSelectedRepo(r)}
                    />
                  </TableCell>
                  <TableCell>{r}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className={styles.buttonRow}>
          <Button onClick={() => setCommunityDeployState('initial')}>
            Back
          </Button>
          <Button
            disabled={selectedRepo === ''}
            appearance="primary"
            onClick={() => setCommunityDeployState('provide-token')}
          >
            Next
          </Button>
        </div>
      </Loader>
    </>
  )
})
