import { useSetAtom } from 'jotai'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useNavigation } from 'react-router-dom'

import { serialAsync } from '~/shared'

import { routes } from '../App/Router.js'
import { useCatchError } from '../hooks/useCatchError.js'
import { eventBus } from '../lib/index.js'
import { appUpdaterService } from '../services/AppUpdaterService.js'
import { ballotService } from '../services/BallotService.js'
import { cacheService } from '../services/CacheService.js'
import { userService } from '../services/UserService.js'
import { ballotsAtom } from '../state/ballots.js'
import { loaderAtom } from '../state/loader.js'
import { updatesAtom } from '../state/updates.js'
import { userAtom, userLoadedAtom } from '../state/user.js'

export const DataLoader: FC = function DataLoader() {
  const catchError = useCatchError()
  const setUpdates = useSetAtom(updatesAtom)
  const setBallots = useSetAtom(ballotsAtom)
  const setUser = useSetAtom(userAtom)
  const setUserLoaded = useSetAtom(userLoadedAtom)
  const setLoading = useSetAtom(loaderAtom)
  const [loadingQueue, setLoadingQueue] = useState<Promise<any>[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  const addToQueue = useCallback(
    (value: Promise<any>) => {
      setLoadingQueue((q) => {
        return [...q, value]
      })
    },
    [setLoadingQueue],
  )

  const _checkForUpdates = useCallback(async () => {
    try {
      const updateInfo = await appUpdaterService.checkForUpdates()
      setUpdates(updateInfo)
    } catch (ex) {
      await catchError(`Failed to check for updates. ${ex}`)
    }
  }, [setUpdates, catchError])

  const checkForUpdates = useMemo(() => {
    return serialAsync(_checkForUpdates)
  }, [_checkForUpdates])

  const _refreshCache = useCallback(async () => {
    await cacheService.refreshCache()
  }, [])

  const refreshCache = useMemo(() => {
    return serialAsync(_refreshCache)
  }, [_refreshCache])

  const _getUser = useCallback(async () => {
    try {
      const user = await userService.getUser()
      setUser(user)
      setUserLoaded(true)
    } catch (ex) {
      await catchError(`Failed to load user information. ${ex}`)
    }
  }, [catchError, setUser, setUserLoaded])

  const getUser = useMemo(() => {
    return serialAsync(_getUser)
  }, [_getUser])

  const _getBallots = useCallback(async () => {
    try {
      const ballots = await ballotService.getBallots()
      setBallots(ballots)
    } catch (ex) {
      await catchError(`Failed to load ballots. ${ex}`)
    }
  }, [setBallots, catchError])

  const getBallots = useMemo(() => {
    return serialAsync(_getBallots)
  }, [_getBallots])

  const _getBallot = useCallback(
    async (e: CustomEvent<{ ballotId: string }>) => {
      try {
        const ballot = await ballotService.getBallot(e.detail.ballotId)
        if (ballot == null) {
          return
        }
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
    return serialAsync(_getBallot)
  }, [_getBallot])

  useEffect(() => {
    if (
      location.pathname === routes.issues.path ||
      location.pathname === routes.pullRequests.path
    ) {
      addToQueue(getBallots())
    }
  }, [location, addToQueue, getBallots])

  useEffect(() => {
    const listeners: Array<() => void> = []
    addToQueue(getUser())

    const updateCacheInterval = setInterval(async () => {
      return await refreshCache().then(async () => {
        await Promise.all([getUser(), getBallots()])
      })
    }, 60 * 1000)

    listeners.push(() => {
      clearInterval(updateCacheInterval)
    })

    void checkForUpdates()
    const checkForUpdatesInterval = setInterval(async () => {
      return await checkForUpdates()
    }, 60 * 1000)

    listeners.push(() => {
      clearInterval(checkForUpdatesInterval)
    })

    listeners.push(
      eventBus.subscribe('user-logged-in', async () => {
        await getUser()
        eventBus.emit('new-user')
      }),
    )

    listeners.push(
      eventBus.subscribe('community-saved, selected-community', async () => {
        await getUser()
        eventBus.emit('new-community')
      }),
    )

    listeners.push(
      eventBus.subscribe('voted', async (e) => {
        await Promise.all([getBallot(e), getUser()])
      }),
    )
    listeners.push(
      eventBus.subscribe('refresh', async () => {
        addToQueue(
          refreshCache().then(async () => {
            await Promise.all([getBallots(), getUser()])
          }),
        )
      }),
    )

    return () => {
      for (const listener of listeners) {
        listener()
      }
    }
  }, [
    setUpdates,
    getUser,
    getBallots,
    addToQueue,
    getBallot,
    navigate,
    checkForUpdates,
    refreshCache,
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
