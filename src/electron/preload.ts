import { contextBridge, ipcRenderer } from 'electron'

import type { InvokeServiceProps, IpcTunnel } from '~/shared'

const ipcTunnel: IpcTunnel = {
  async invokeService(invokeProps: InvokeServiceProps) {
    return await ipcRenderer.invoke('serviceHandler', invokeProps)
  },
  onUpdate(fn) {
    ipcRenderer.on('update-available', fn)
    return () => {
      ipcRenderer.off('update-available', fn)
    }
  },
  async restartAndUpdate() {
    return await ipcRenderer.invoke('restart-and-update')
  },
}

contextBridge.exposeInMainWorld('ipcTunnel', ipcTunnel)
