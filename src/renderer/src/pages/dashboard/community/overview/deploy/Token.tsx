import { Button, Field, Input } from '@fluentui/react-components'
import { FC, memo } from 'react'

import { useDataStore } from '../../../../../store/store.js'
import { useCommunityDeployStyle } from './styles.js'

export const Token: FC = memo(function Deploy() {
  const pat = useDataStore((s) => s.communityDeploy.communityPat)
  const setPat = useDataStore((s) => s.communityDeploy.setCommunityPat)
  const setCommunityDeployState = useDataStore(
    (s) => s.communityDeploy.setState,
  )
  const selectedOrg = useDataStore((s) => s.communityDeploy.selectedOrg)
  const styles = useCommunityDeployStyle()

  return (
    <>
      <div>
        <p>
          Gov4Git requires access to a Personal Access Token in order to manage
          the newly deployed community repo.
        </p>
        
        <p>
          To set your organization as the resource owner when generating a personal access token, your organization must opt into fine-grained personal access tokens.
          If your organization has not already opted in, you will not see it as an option. 
          You can check and set this policy by following the steps in{' '}
            <a
              target="_blank"
              href="https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization"
              rel="noreferrer"
            >
              Setting a personal access token policy for your organization.
            </a>{' '}
        </p>
        <h3 className={styles.instructionTitle}>
          Generating a Personal Access Token
        </h3>
        <ol className={styles.instructionsList}>
          <li>
            Visit{' '}
            <a
              target="_blank"
              href="https://github.com/settings/personal-access-tokens/new"
              rel="noreferrer"
            >
              https://github.com/settings/personal-access-tokens/new
            </a>{' '}
            to get started.
          </li>
          <li>
            Provide a token name, expiration date, and description for the
            token.
          </li>
          <li>
            Select <strong>{selectedOrg}</strong> as the Resource owner.
          </li>
          <li>Select All repositories for the Repository access option.</li>
          <li>
            <div>
              Under Permissions, select the following Repository permissions.
            </div>
            <table className={styles.accessTable}>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Access Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Actions</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Administration</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Contents</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Environments</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Issues</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Pull requests</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Secrets</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Variables</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Workflows</td>
                  <td>Read and Write</td>
                </tr>
              </tbody>
            </table>
            <div>and select the following Organization permissions</div>
            <table className={styles.accessTable}>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Access Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Members</td>
                  <td>Read</td>
                </tr>
              </tbody>
            </table>
          </li>
          <li>Select Generate token</li>
          <li>Copy and paste the token below</li>
        </ol>
      </div>
      <Field
        // @ts-expect-error children signature
        label={{
          children: () => <label htmlFor="pat">Personal Access Token</label>,
        }}
      >
        <Input
          type="password"
          id="pat"
          value={pat}
          onChange={(e) => setPat(e.target.value)}
        />
      </Field>
      <div className={styles.buttonRow}>
        <Button onClick={() => setCommunityDeployState('repo-select')}>
          Back
        </Button>
        <Button
          disabled={pat === ''}
          appearance="primary"
          onClick={() => setCommunityDeployState('deploy')}
        >
          Next
        </Button>
      </div>
    </>
  )
})
