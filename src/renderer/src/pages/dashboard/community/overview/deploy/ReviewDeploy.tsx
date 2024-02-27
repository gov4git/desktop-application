import { Button } from '@fluentui/react-components'
import { FC, memo, useCallback, useState } from 'react'

import { Message } from '../../../../../components/Message.js'
import { useDataStore } from '../../../../../store/store.js'
import { useMessageStyles } from '../../../../../styles/index.js'

export const ReviewDeploy: FC = memo(function ReviewDeploy() {
  const [loading, setLoading] = useState(false)
  const setCommunityOverviewState = useDataStore(
    (s) => s.communityOverview.setState,
  )
  const setCommunityDeployState = useDataStore(
    (s) => s.communityDeploy.setState,
  )
  const selectedOrg = useDataStore((s) => s.communityDeploy.selectedOrg)
  const selectedRepo = useDataStore((s) => s.communityDeploy.selectedRepo)
  const deployCommunity = useDataStore((s) => s.communityDeploy.deployCommunity)
  const messageStyles = useMessageStyles()
  const [successMessage, setSuccessMessage] = useState('')

  const deploy = useCallback(async () => {
    setLoading(true)
    await deployCommunity()
    setLoading(false)
    const message = [
      `Success. A Gov4Git community has been deployed for ${selectedOrg}/${selectedRepo}.`,
      `You can view the newly created community repo at <a href="https://github.com/${selectedOrg}/${selectedRepo}-gov.public" target="_blank" rel="noreferrer">https://github.com/${selectedOrg}/${selectedRepo}-gov.public</a>.`,
      'Visit <a href="https://github.com/gov4git/gov4git" target="_blank" rel="noreferrer">https://github.com/gov4git/gov4git</a>',
      'for documenation on how to manage Gov4Git community repos.',
    ].join(' ')
    console.log(message)
    setSuccessMessage(message)
  }, [
    setLoading,
    selectedOrg,
    selectedRepo,
    deployCommunity,
    setSuccessMessage,
  ])

  const dismissMessage = useCallback(() => {
    setSuccessMessage('')
    setCommunityDeployState('initial')
    setCommunityOverviewState('overview')
  }, [setSuccessMessage, setCommunityOverviewState, setCommunityDeployState])

  return (
    <>
      {successMessage === '' && (
        <div>
          <Button
            disabled={loading}
            appearance="primary"
            type="submit"
            onClick={deploy}
          >
            {loading && (
              <>
                <i className="codicon codicon-loading codicon-modifier-spin" />
                &nbsp;
              </>
            )}
            Deploy Gov4Git for {selectedOrg}/{selectedRepo}
          </Button>
        </div>
      )}
      {successMessage !== '' && (
        <Message
          className={messageStyles.success}
          messages={[successMessage]}
          onClose={dismissMessage}
        />
      )}
    </>
  )
})
