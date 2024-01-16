import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Button,
  Card,
  Text,
} from '@fluentui/react-components'
import { useAtomValue } from 'jotai'
import { parse } from 'marked'
import {
  ChangeEventHandler,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { formatDecimal } from '~/shared'

import type { Motion } from '../../../electron/db/schema.js'
import { useRefreshCache } from '../hooks/cache.js'
import { useFetchCommunities } from '../hooks/communities.js'
import { useCatchError } from '../hooks/useCatchError.js'
import { motionService } from '../services/index.js'
import { communityAtom } from '../state/community.js'
import { useBadgeStyles } from '../styles/badges.js'
import { useMessageStyles } from '../styles/messages.js'
import { BubbleSlider } from './BubbleSlider.js'
import { useIssueBallotStyles } from './IssueBallot.styles.js'
import { Message } from './Message.js'

export type IssueBallotProps = {
  motion: Motion
}

export const IssueBallot: FC<IssueBallotProps> = function IssueBallot({
  motion,
}) {
  const styles = useIssueBallotStyles()
  const badgeStyles = useBadgeStyles()
  const [voteScore, setVoteScore] = useState(motion.userScore)
  const [displayVoteScore, setDisplayVoteScore] = useState(
    formatDecimal(voteScore),
  )
  const [voteStrengthInCredits, setVoteStrengthInCredits] = useState(0)
  const [totalCostInCredits, setTotalCostInCredits] = useState(0)
  const catchError = useCatchError()
  const messageStyles = useMessageStyles()
  const community = useAtomValue(communityAtom)
  const [fetchingNewBallot, setFetchingNewBallot] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [inputWidth, setInputWidth] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [, setTimer] = useState<number | null>(null)
  const refreshCache = useRefreshCache()
  const getCommunities = useFetchCommunities()

  const githubLink = useMemo(() => {
    return motion.trackerUrl
  }, [motion])

  const githubLinkText = useMemo(() => {
    const itemType = motion.type === 'concern' ? 'issue' : 'pull request'
    return `GitHub ${itemType} #${motion.motionId}`
  }, [motion])

  const maxScore = useMemo(() => {
    if (community == null) return 0
    return Math.sqrt(
      community.userVotingCredits + Math.abs(motion.userStrength),
    )
  }, [motion, community])

  const minScore = useMemo(() => {
    if (community == null) return 0
    return -Math.sqrt(
      community.userVotingCredits + Math.abs(motion.userStrength),
    )
  }, [motion, community])

  useEffect(() => {
    const score = voteScore
    const sign = score < 0 ? -1 : 1
    const totalCredits = sign * Math.pow(score, 2)
    setTotalCostInCredits(Math.abs(totalCredits))
    const newCreditsToVote = totalCredits - motion.userStrength
    setVoteStrengthInCredits(newCreditsToVote)
  }, [voteScore, setVoteStrengthInCredits, motion, setTotalCostInCredits])

  const vote = useCallback(() => {
    async function run() {
      if (voteStrengthInCredits !== 0) {
        setFetchingNewBallot(true)
        try {
          await motionService.vote({
            name: motion.ballotId,
            choice: motion.choice ?? '',
            strength: `${voteStrengthInCredits}`,
          })
          await refreshCache()
          await getCommunities()
          const direction = voteScore < 0 ? 'decrease' : 'increase'
          setSuccessMessage(
            `Success. You have submitted a vote to ${direction} priority by ${Math.abs(
              voteScore,
            )}. Your vote is in pending status until it is tallied by the community. It may take a few hours for your vote to be tallied and reflected by the community.`,
          )
          setFetchingNewBallot(false)
        } catch (ex: any) {
          if (
            ex != null &&
            ex.message != null &&
            typeof ex.message === 'string' &&
            (ex.message as string).toLowerCase().endsWith('ballot is closed')
          ) {
            setFetchingNewBallot(false)
            setVoteError(
              'Sorry, this ballot is closed to voting. Please refresh the page to get the latest list of ballots.',
            )
          } else {
            await catchError(`Failed to cast vote. ${ex}`)
            setFetchingNewBallot(false)
            setVoteError(
              `There was an error voting. Please view the full logs at the top of the page.`,
            )
          }
        }
      }
    }
    void run()
  }, [
    motion,
    voteStrengthInCredits,
    catchError,
    setFetchingNewBallot,
    refreshCache,
    voteScore,
    getCommunities,
  ])

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const val = e.target.value
      const regex = /^-?\d+\.?\d*$/
      if (val === '' || !regex.test(val)) {
        setVoteScore((v: number) => {
          setDisplayVoteScore(formatDecimal(v))
          return v
        })
      } else {
        const value = +e.target.value
        if (value > maxScore) {
          setDisplayVoteScore(formatDecimal(maxScore))
          setVoteScore(+formatDecimal(maxScore))
        } else if (value < minScore) {
          setDisplayVoteScore(formatDecimal(minScore))
          setVoteScore(+formatDecimal(minScore))
        } else {
          setDisplayVoteScore(e.target.value)
          setVoteScore(+formatDecimal(value))
        }
      }
    },
    [setVoteScore, minScore, maxScore, setDisplayVoteScore],
  )

  useEffect(() => {
    setInputWidth(displayVoteScore.length + 4)
  }, [setInputWidth, displayVoteScore])

  const change = useCallback(
    (amount: number) => {
      setVoteScore((v: number) => {
        const newVal = v + amount
        if (newVal > maxScore) return +formatDecimal(maxScore)
        if (newVal < minScore) return +formatDecimal(minScore)
        return +formatDecimal(newVal)
      })
    },
    [setVoteScore, minScore, maxScore],
  )

  const onMouseDown = useCallback(
    (direction: 'up' | 'down') => {
      switch (direction) {
        case 'up':
          setTimer((t) => {
            if (t != null) clearInterval(t)
            return window.setInterval(() => {
              change(1)
            }, 150)
          })
          break
        case 'down':
          setTimer((t) => {
            if (t != null) clearInterval(t)
            return window.setInterval(() => {
              change(-1)
            }, 150)
          })
          break
      }
    },
    [change, setTimer],
  )

  const stop = useCallback(() => {
    setTimer((t) => {
      if (t != null) clearInterval(t)
      return null
    })
  }, [setTimer])

  const cancelVote = useCallback(() => {
    setVoteScore(motion.userScore)
  }, [setVoteScore, motion])

  const dismissError = useCallback(() => {
    setVoteError(null)
  }, [setVoteError])

  const dismissMessage = useCallback(() => {
    setSuccessMessage(null)
  }, [setSuccessMessage])

  useEffect(() => {
    setDisplayVoteScore(formatDecimal(voteScore))
  }, [voteScore, setDisplayVoteScore])

  useEffect(() => {
    const listener = () => {
      stop()
    }
    window.addEventListener('mouseup', listener)
    return () => {
      window.removeEventListener('mouseup', listener)
    }
  }, [stop])

  return (
    <Card className={styles.card}>
      <div className={styles.root}>
        <div className={styles.rankArea}>
          <Badge
            className={badgeStyles.primary}
            size="extra-large"
            shape="circular"
          >
            <Text size={400}>{formatDecimal(motion.score)}</Text>
          </Badge>
          {motion.userVoted && (
            <Text size={200}>
              <span>
                Your {motion.userVotePending ? 'pending' : ''} contribution:{' '}
                {formatDecimal(motion.userScore)}
              </span>
            </Text>
          )}
        </div>
        <div className={styles.issueArea}>
          <hgroup className={styles.titleArea}>
            <h2>{motion.title}</h2>
            {githubLink != null && (
              <a href={githubLink} target="_blank" rel="noreferrer">
                {githubLinkText}
              </a>
            )}
          </hgroup>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: parse(motion.description),
            }}
          ></div>
          <div>
            {motion.status === 'open' && (
              <div className={styles.votingArea}>
                <Accordion collapsible multiple>
                  <AccordionItem value="1">
                    <AccordionHeader>
                      <Text weight="regular" size={500}>
                        Vote
                      </Text>
                    </AccordionHeader>
                    <AccordionPanel>
                      <div className={styles.voteContainer}>
                        <div className={styles.voteArea}>
                          <div>
                            <div className={styles.label}>
                              <label htmlFor={`ballot-vote-${motion.motionId}`}>
                                Vote:
                              </label>
                            </div>
                            <div className={styles.voteRow}>
                              <button
                                className={styles.voteButton}
                                onClick={() => change(-1)}
                                onMouseDown={() => onMouseDown('down')}
                                // onMouseUp={stop}
                              >
                                <i className="codicon codicon-chevron-down" />
                              </button>
                              <input
                                className={styles.voteInput}
                                id={`ballot-vote-${motion.motionId}`}
                                type="text"
                                value={displayVoteScore}
                                onInput={onChange}
                                // onBlur={onBlur}
                                style={{
                                  width: `${inputWidth}ch`,
                                }}
                              />
                              <button
                                className={styles.voteButton}
                                onClick={() => change(1)}
                                onMouseUp={stop}
                                onMouseDown={() => onMouseDown('up')}
                              >
                                <i className="codicon codicon-chevron-up" />
                              </button>
                            </div>
                          </div>
                          <div className={styles.sliderArea}>
                            <div className={styles.label}>
                              Corresponding cost in credits:
                            </div>
                            <BubbleSlider
                              value={totalCostInCredits}
                              disabled={true}
                              min={0}
                              max={
                                (community?.userVotingCredits ?? 0) +
                                motion.userStrength
                              }
                              ariaLabel="Cost in credits"
                              onChange={() => undefined}
                            />
                          </div>
                        </div>
                        <div className={styles.buttonRow}>
                          <Button
                            onClick={cancelVote}
                            appearance="secondary"
                            disabled={fetchingNewBallot}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={vote}
                            appearance="primary"
                            disabled={
                              fetchingNewBallot || voteStrengthInCredits === 0
                            }
                          >
                            {!fetchingNewBallot && 'Vote'}
                            {fetchingNewBallot && (
                              <i className="codicon codicon-loading codicon-modifier-spin" />
                            )}
                          </Button>
                        </div>
                        {voteError != null && (
                          <div className={styles.messageArea}>
                            <Message
                              className={messageStyles.error}
                              messages={[voteError]}
                              onClose={dismissError}
                            />
                          </div>
                        )}
                        {successMessage && (
                          <div className={styles.messageArea}>
                            <Message
                              className={messageStyles.success}
                              messages={[successMessage]}
                              onClose={dismissMessage}
                            />
                          </div>
                        )}
                      </div>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
