import { useCallback, useEffect, useState } from 'react'

import { logService } from '../services/index.js'
import { useDataStore } from '../store/store.js'

export function useLogs(): string | null {
  const [logs, setLogs] = useState<string | null>(null)
  const tryRun = useDataStore((s) => s.tryRun)
  const getLogs = useCallback(async () => {
    await tryRun(async () => {
      const l = await logService.getLogs()
      setLogs(l)
    }, 'Failed to load logs.')
  }, [setLogs, tryRun])

  useEffect(() => {
    void getLogs()
  }, [getLogs])

  return logs
}
