import type { InvokeServiceProps } from '~/shared'

export async function serviceHandler<T = unknown>(
  invokeProps: InvokeServiceProps,
): Promise<T> {
  console.log(
    `= Calling Backend Service: ${invokeProps.service}.${invokeProps.method} =`,
  )
  console.log(JSON.stringify(invokeProps, undefined, 2))
  const results = await window.ipcTunnel.invokeService(invokeProps)
  console.log(
    `= Backend Response: ${invokeProps.service}.${invokeProps.method} =`,
  )
  console.log(JSON.stringify(results, undefined, 2))
  if (results instanceof Error) {
    console.error('========== Caught Backend Error ==========')
    console.error('PROPS:')
    console.error(invokeProps)
    console.error(results)
    throw results
  }
  return results as T
}
