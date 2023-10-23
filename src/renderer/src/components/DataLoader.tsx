import { useSetAtom } from 'jotai'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/Router.js'
import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/eventBus.js'
import { debounceAsync } from '../lib/functions.js'
import { ballotService } from '../services/BallotService.js'
import { configService } from '../services/ConfigService.js'
import { userService } from '../services/UserService.js'
import { ballotsAtom } from '../state/ballots.js'
import { configAtom } from '../state/config.js'
import { loaderAtom } from '../state/loader.js'
import { updatesAtom } from '../state/updates.js'
import { userAtom, userLoadedAtom } from '../state/user.js'

export const DataLoader: FC = function DataLoader() {
  const catchError = useCatchError()
  const setUpdates = useSetAtom(updatesAtom)
  const setConfig = useSetAtom(configAtom)
  const setBallots = useSetAtom(ballotsAtom)
  const setUser = useSetAtom(userAtom)
  const setUserLoaded = useSetAtom(userLoadedAtom)
  const setLoading = useSetAtom(loaderAtom)
  const [loadingQueue, setLoadingQueue] = useState<Promise<any>[]>([])
  const navigate = useNavigate()

  const addToQueue = useCallback(
    (value: Promise<any>) => {
      setLoadingQueue((q) => {
        return [...q, value]
      })
    },
    [setLoadingQueue],
  )

  const _getConfig = useCallback(async () => {
    try {
      const config = await configService.getConfig()
      setConfig(config)
    } catch (ex) {
      await catchError(`Failed to load config. ${ex}`)
    }

    // addToQueue(run())
  }, [catchError, setConfig])

  const getConfig = useMemo(() => {
    return debounceAsync(_getConfig)
  }, [_getConfig])

  const _getUser = useCallback(async () => {
    try {
      const user = await userService.getUser()
      setUser(user)
      setUserLoaded(true)
    } catch (ex) {
      await catchError(`Failed to load user information. ${ex}`)
    }
    // addToQueue(run())
  }, [catchError, setUser, setUserLoaded])

  const getUser = useMemo(() => {
    return debounceAsync(_getUser)
  }, [_getUser])

  const _getBallots = useCallback(async () => {
    try {
      const ballots = await ballotService.getOpen()
      setBallots(ballots)
    } catch (ex) {
      await catchError(`Failed to load ballots. ${ex}`)
    }
    // addToQueue(run())
  }, [setBallots, catchError])

  const getBallots = useMemo(() => {
    return debounceAsync(_getBallots)
  }, [_getBallots])

  const _updateBallotCache = useCallback(async () => {
    try {
      const ballots = await ballotService.updateCache()
      setBallots(ballots)
    } catch (ex) {
      await catchError(`Failed to load ballots. ${ex}`)
    }
    // addToQueue(run())
  }, [setBallots, catchError])

  const updateBallotCache = useMemo(() => {
    return debounceAsync(_updateBallotCache)
  }, [_updateBallotCache])

  const _getBallot = useCallback(
    async (e: CustomEvent<{ ballotId: string }>) => {
      try {
        const ballot = await ballotService.getBallot(e.detail.ballotId)
        setBallots((ballots) => {
          if (ballots == null) return [ballot]
          const existingInd = ballots.findIndex(
            (b) => b.identifier === ballot.identifier,
          )
          if (existingInd !== -1) {
            ballots[existingInd] = ballot
          } else {
            ballots.push(ballot)
          }
          return [...ballots]
        })
        eventBus.emit('new-ballot', { ballotId: ballot.identifier })
      } catch (ex) {
        await catchError(`Failed to fetch ballot: ${e.detail}. ${ex}`)
      }
    },
    [catchError, setBallots],
  )

  const getBallot = useMemo(() => {
    return debounceAsync(_getBallot)
  }, [_getBallot])

  useEffect(() => {
    const listeners: Array<() => void> = []
    addToQueue(getConfig())
    addToQueue(getUser())
    addToQueue(getBallots())

    const interval = setInterval(async () => {
      return await updateBallotCache().then(getUser)
    }, 60 * 1000)

    listeners.push(() => {
      clearInterval(interval)
    })

    listeners.push(
      window.ipcTunnel.onUpdate(() => {
        setUpdates(true)
      }),
    )
    listeners.push(
      eventBus.subscribe('user-logged-in', async () => {
        // const prom = Promise.all([getConfig(), getUser(), updateBallotCache()])
        const prom = getConfig().then(updateBallotCache).then(getUser)
        addToQueue(prom)
        await prom
        navigate(routes.issues.path)
      }),
    )
    listeners.push(
      eventBus.subscribe('voted', async (e) => {
        await getBallot(e).then(getUser)
        // await Promise.all([getUser(), getBallot(e)])
      }),
    )

    return () => {
      for (const listener of listeners) {
        listener()
      }
    }
  }, [
    setUpdates,
    getConfig,
    getUser,
    getBallots,
    addToQueue,
    getBallot,
    updateBallotCache,
    navigate,
  ])

  useEffect(() => {
    async function run() {
      if (loadingQueue.length > 0) {
        setLoading(true)
        await Promise.all(loadingQueue)
        setLoadingQueue([])
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    void run()
  }, [loadingQueue, setLoadingQueue, setLoading])

  return <></>
}
