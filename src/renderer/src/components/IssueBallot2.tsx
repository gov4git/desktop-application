import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Spinner,
  Text,
} from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { parse } from 'marked'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { Ballot } from '~/shared'

import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/eventBus.js'
import { formatDecimal } from '../lib/index.js'
import { ballotService } from '../services/index.js'
import { configAtom } from '../state/config.js'
import { userAtom } from '../state/user.js'
import { useButtonStyles } from '../styles/buttons.js'
import { BubbleSlider } from './BubbleSlider.js'
import { useIssueBallotStyles } from './IssueBallot2.styles.js'

export type IssueBallotProps = {
  ballot: Ballot
}
export const IssueBallot2: FC<IssueBallotProps> = function IssueBallot2({
  ballot,
}) {
  const styles = useIssueBallotStyles()
  const [voteScore, setVoteScore] = useState(0.0)
  const [voteStrengthInCredits, setVoteStrengthInCredits] = useState(0)
  const [additionalCostInCredits, setAdditionalCostInCredits] = useState(0)
  const [totalCostInCredits, setTotalCostInCredits] = useState(0)
  const [newTotalVoteScore, setNewTotalVoteScore] = useState(0)
  const [existingSpentCredits, setExistingSpentCredits] = useState(0)
  const catchError = useCatchError()
  const buttonStyles = useButtonStyles()
  const [dialogOpen, setDialogOpen] = useState(false)
  const user = useAtomValue(userAtom)
  const config = useAtomValue(configAtom)
  const [fetchingNewBallot, setFetchingNewBallot] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)

  useEffect(() => {
    return eventBus.subscribe(
      'new-ballot',
      (e: CustomEvent<{ ballotId: string }>) => {
        if (ballot.identifier === e.detail.ballotId) {
          setFetchingNewBallot(false)
        }
      },
    )
  }, [setFetchingNewBallot, ballot])

  const githubLink = useMemo(() => {
    if (config == null) return null
    const linkComponent = ballot.identifier.split('/').slice(1).join('/')
    return `${config.project_repo}/${linkComponent}`
  }, [config, ballot])
  const maxScore = useMemo(() => {
    if (user == null) return 0
    return (
      Math.sqrt(
        user.voting_credits +
          ballot.user.pendingCredits +
          ballot.user.talliedCredits,
      ) -
      ballot.user.talliedScore -
      ballot.user.pendingScoreDiff
    )
  }, [ballot, user])

  const minScore = useMemo(() => {
    if (user == null) return 0
    return (
      -Math.sqrt(
        user.voting_credits +
          ballot.user.pendingCredits +
          ballot.user.talliedCredits,
      ) -
      ballot.user.talliedScore -
      ballot.user.pendingScoreDiff
    )
  }, [ballot, user])

  const voteConfirmationMessage = useMemo(() => {
    if (user == null) return ''
    const change = voteScore >= 0 ? 'Increasing' : 'Decreasing'

    if (ballot.user.pendingScoreDiff === 0 && ballot.user.talliedScore === 0) {
      return `Voting ${voteScore} points will cost a total of ${additionalCostInCredits} credits`
    }

    let additionalCostMessage = ''
    if (additionalCostInCredits < 0) {
      additionalCostMessage = `restoring ${formatDecimal(
        Math.abs(additionalCostInCredits),
      )} of the ${formatDecimal(
        existingSpentCredits,
      )} voting credits allocated to this ballot.`
    } else {
      additionalCostMessage = `${formatDecimal(
        additionalCostInCredits,
      )} credits in addition to the ${formatDecimal(
        existingSpentCredits,
      )} credits allocated to this ballot`
    }

    const message = `${change} your vote by ${formatDecimal(
      voteScore,
    )} brings your total vote to ${formatDecimal(
      newTotalVoteScore,
    )} and costing a total of ${formatDecimal(
      totalCostInCredits,
    )} voting credits, ${additionalCostMessage}`
    return message
  }, [
    voteScore,
    ballot,
    user,
    newTotalVoteScore,
    additionalCostInCredits,
    existingSpentCredits,
    totalCostInCredits,
  ])

  useEffect(() => {
    const score =
      voteScore + ballot.user.pendingScoreDiff + ballot.user.talliedScore
    setNewTotalVoteScore(score)
    const sign = score < 0 ? -1 : 1
    const spentCredits = ballot.user.talliedCredits + ballot.user.pendingCredits
    setExistingSpentCredits(Math.abs(spentCredits))
    const totalCredits = sign * Math.pow(score, 2)
    setTotalCostInCredits(Math.abs(totalCredits))
    const additionalCosts = Math.abs(totalCredits) - Math.abs(spentCredits)
    // if (additionalCosts < 0) {
    //   additionalCosts = Math.abs(spentCredits) - Math.abs(additionalCosts)
    // }
    setAdditionalCostInCredits(additionalCosts)
    const newCreditsToVote = totalCredits - spentCredits
    setVoteStrengthInCredits(newCreditsToVote)
  }, [
    voteScore,
    setVoteStrengthInCredits,
    ballot,
    setNewTotalVoteScore,
    setExistingSpentCredits,
    setTotalCostInCredits,
  ])

  const vote = useCallback(() => {
    async function run() {
      if (voteStrengthInCredits !== 0) {
        setDialogOpen(false)
        setFetchingNewBallot(true)
        setVoteScore(0)
        await ballotService
          .vote({
            name: ballot.identifier,
            choice: ballot.choices[0] ?? '',
            strength: `${voteStrengthInCredits}`,
          })
          .catch(async (ex) => {
            if (
              ex != null &&
              ex.message != null &&
              typeof ex.message === 'string' &&
              (ex.message as string).toLowerCase().endsWith('ballot is closed')
            ) {
              setVoteError(
                'Sorry, this ballot is closed to voting. Please refresh the page to get the latest list of ballots.',
              )
            } else {
              await catchError(`Failed to cast vote. ${ex}`)
            }
          })
        eventBus.emit('voted', { ballotId: ballot.identifier })
      }
    }
    void run()
  }, [
    ballot,
    voteStrengthInCredits,
    catchError,
    setDialogOpen,
    setVoteScore,
    setFetchingNewBallot,
  ])

  const onSlideChange = useCallback(
    (newValue: number) => {
      setVoteScore(newValue)
    },
    [setVoteScore],
  )

  const cancelVote = useCallback(() => {
    setVoteScore(0)
    setDialogOpen(false)
  }, [setVoteScore, setDialogOpen])

  return (
    <Card className={styles.card}>
      <div className={styles.root} key={ballot.identifier}>
        {voteError != null && <span>{voteError}</span>}
        {voteError == null && (
          <div className={styles.votingArea}>
            {fetchingNewBallot && <Spinner />}
            {!fetchingNewBallot && (
              <>
                <Text>{formatDecimal(ballot.score)}</Text>
                <div
                  style={{
                    fontSize: '.8rem',
                    marginBottom: '12px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: ballot.user.contributionMessage,
                  }}
                />
                <BubbleSlider
                  ariaLabel={`Vote strength is ${voteScore}`}
                  min={Math.ceil(minScore)}
                  max={Math.floor(maxScore)}
                  step="1"
                  value={voteScore}
                  onChange={onSlideChange}
                  hideBubble={voteScore === 0}
                />
                <div className={styles.buttonArea}>
                  {voteScore !== 0 && (
                    <Dialog open={dialogOpen} modalType="alert">
                      {/* <DialogTrigger disableButtonEnhancement> */}
                      <Button onClick={() => setDialogOpen(true)}>Vote</Button>
                      {/* </DialogTrigger> */}
                      <DialogSurface>
                        <DialogBody>
                          <DialogTitle>Confirm Vote</DialogTitle>
                          <DialogContent>
                            {voteConfirmationMessage}
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={cancelVote}>Cancel Vote</Button>
                            <Button
                              onClick={vote}
                              className={buttonStyles.primary}
                            >
                              Vote
                            </Button>
                          </DialogActions>
                        </DialogBody>
                      </DialogSurface>
                    </Dialog>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        <div className={styles.issueArea}>
          <h2 className={styles.title}>{ballot.title}</h2>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: parse(ballot.description, {
                headerIds: false,
                mangle: false,
              }),
            }}
          ></div>
          {githubLink != null && (
            <div className={styles.issueLinkArea}>
              <a href={githubLink} target="_blank" rel="noreferrer">
                View in GitHub
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
