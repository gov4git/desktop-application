export type ServiceErrorResponse = {
  ok: false
  statusCode: number
  error: string
}

export type ServiceSuccessResponse<T> = {
  ok: true
  statusCode: number
  data: T
}

export type ServiceResponse<T> =
  | ServiceErrorResponse
  | ServiceSuccessResponse<T>
