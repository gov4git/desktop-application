import { useCallback, useEffect, useState } from 'react'

import { logService } from '../services/index.js'
import { useCatchError } from '../store/hooks/globalHooks.js'

export function useLogs(): string | null {
  const [logs, setLogs] = useState<string | null>(null)
  const catchError = useCatchError()
  const getLogs = useCallback(async () => {
    try {
      const l = await logService.getLogs()
      setLogs(l)
    } catch (ex) {
      await catchError(`Failed to load logs. ${ex}`)
    }
  }, [setLogs, catchError])

  useEffect(() => {
    void getLogs()
  }, [getLogs])

  return logs
}
