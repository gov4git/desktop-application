export async function restartAndUpdate(): Promise<void> {
  await window.ipcTunnel.restartAndUpdate()
}
