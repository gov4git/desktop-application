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
import {
  ChangeEventHandler,
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Ballot } from '~/shared'

import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/eventBus.js'
import { formatDecimal } from '../lib/index.js'
import { ballotService } from '../services/index.js'
import { userAtom } from '../state/user.js'
import { useButtonStyles } from '../styles/buttons.js'
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
  const [newTotalVoteScore, setNewTotalVoteScore] = useState(0)
  const [existingSpentCredits, setExistingSpentCredits] = useState(0)
  const catchError = useCatchError()
  const [left, setLeft] = useState('50%')
  const buttonStyles = useButtonStyles()
  const [dialogOpen, setDialogOpen] = useState(false)
  const user = useAtomValue(userAtom)
  const [fetchingNewBallot, setFetchingNewBallot] = useState(false)

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
      return `Voting ${voteScore} points will cost a total of ${voteStrengthInCredits} credits`
    }

    const message = `${change} your vote by ${formatDecimal(
      voteScore,
    )} brings your total vote to ${formatDecimal(
      newTotalVoteScore,
    )}, costing an additional ${formatDecimal(
      voteStrengthInCredits,
    )} voting credits in addition to the ${formatDecimal(
      existingSpentCredits,
    )} credits allocated to this ballot`
    return message
  }, [
    voteScore,
    ballot,
    user,
    newTotalVoteScore,
    voteStrengthInCredits,
    existingSpentCredits,
  ])

  useEffect(() => {
    const score =
      voteScore + ballot.user.pendingScoreDiff + ballot.user.talliedScore
    setNewTotalVoteScore(score)
    const sign = score < 0 ? -1 : 1
    const spentCredits = ballot.user.talliedCredits + ballot.user.pendingCredits
    setExistingSpentCredits(spentCredits)
    const totalCredits = sign * Math.pow(score, 2)
    const newCreditsToVote = totalCredits - spentCredits
    setVoteStrengthInCredits(newCreditsToVote)
  }, [
    voteScore,
    setVoteStrengthInCredits,
    ballot,
    setNewTotalVoteScore,
    setExistingSpentCredits,
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
            await catchError(`Failed to cast vote. ${ex}`)
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

  const tally = useCallback(
    (name: string) => {
      async function run() {
        await ballotService.tallyBallot(name).catch(async (ex) => {
          await catchError(`Failed to tally votes. Error ${ex}`)
        })
      }
      void run()
    },
    [catchError],
  )

  const onSlide: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (user != null) {
        const rangeVal = +e.target.value
        const slideVal = Number(
          ((rangeVal - -user.voting_score) * 100) /
            (user.voting_score - -user.voting_score),
        )
        const newPosition = 10 - slideVal * 0.2
        setVoteScore(rangeVal)
        setLeft(`calc(${slideVal}% + (${newPosition}px))`)
      }
    },
    [setVoteScore, setLeft, user],
  )

  const cancelVote = useCallback(() => {
    setVoteScore(0)
    setDialogOpen(false)
    setLeft('50%')
  }, [setVoteScore, setDialogOpen, setLeft])

  const bubbleStyles = useMemo(() => {
    return {
      left: left,
    }
  }, [left])

  return (
    <Card className={styles.card}>
      <div className={styles.root} key={ballot.identifier}>
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
              <div className={styles.sliderArea}>
                {/* <i className="codicon codicon-chevron-down" /> */}
                <input
                  className={styles.slider}
                  id={`vote-slider-${ballot.identifier}`}
                  aria-label={`Vote stength is ${voteScore}`}
                  step="1"
                  type="range"
                  min={Math.ceil(minScore)}
                  max={Math.floor(maxScore)}
                  value={voteScore}
                  onChange={onSlide}
                ></input>
                {voteScore !== 0 && (
                  <div style={bubbleStyles} className={styles.bubble}>
                    {formatDecimal(voteScore)}
                  </div>
                )}
                {/* <i className="codicon codicon-chevron-up" /> */}
              </div>
              <div className={styles.buttonArea}>
                {voteScore !== 0 && (
                  <Dialog open={dialogOpen} modalType="alert">
                    {/* <DialogTrigger disableButtonEnhancement> */}
                    <Button onClick={() => setDialogOpen(true)}>Vote</Button>
                    {/* </DialogTrigger> */}
                    <DialogSurface>
                      <DialogBody>
                        <DialogTitle>Confirm Vote</DialogTitle>
                        <DialogContent>{voteConfirmationMessage}</DialogContent>
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
        </div>
        {/* {user?.is_maintainer && (
        <div>
          <Button
            className={buttonStyles.primary}
            onClick={() => tally(ballot.identifier)}
          >
            Tally
          </Button>
        </div>
      )} */}
      </div>
    </Card>
  )
}
