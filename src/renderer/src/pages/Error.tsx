import { useRouteError } from 'react-router-dom'

export const ErrorPage = function ErrorPage() {
  const error: { statusText?: string; message?: string } = useRouteError() as {
    statusText?: string
    message?: string
  }
  return (
    <div id="error-page">
      <h1>An unexpected error has occurred.</h1>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <p>
        Please restart the app and{' '}
        <a
          href="https://github.com/gov4git/desktop-application/issues/new"
          target="_blank"
          rel="noreferrer"
        >
          open a new issue
        </a>{' '}
        if the problem persists.
      </p>
    </div>
  )
}
