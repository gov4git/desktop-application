import {
  appendFileSync,
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

import fastRedact from 'fast-redact'

import { AbstractLogService } from '~/shared'
import { isRecord } from '~/shared'

import { toResolvedPath } from '../lib/paths.js'

export type Redacter = (...args: any[]) => string

export class LogService extends AbstractLogService {
  protected declare logFile: string
  protected declare redact: Redacter
  protected declare fd: number

  constructor(logPath: string) {
    super()
    this.logFile = toResolvedPath(logPath)
    this.initLog()
    this.redact = fastRedact({
      paths: [
        'private_key_ed25519',
        'public_credentials.*',
        'user.pat',
        'pat',
        'auth.*.*',
        'args[*].token',
      ],
      serialize: (o) => {
        return JSON.stringify(o, undefined, 2)
      },
    })
  }

  public initLog = () => {
    mkdirSync(dirname(this.logFile), { recursive: true })
    writeFileSync(this.logFile, '', 'utf-8')
    this.fd = openSync(this.logFile, 'a')
  }

  protected getDateTime = () => {
    return new Date().toISOString()
  }

  protected formatString = (...args: any[]): string => {
    return args
      .map((v) => {
        if (v instanceof Error) {
          return `${v}`
        } else if (isRecord(v)) {
          return this.redact(structuredClone(v))
        } else if (Array.isArray(v)) {
          return `${JSON.stringify(v, undefined, 2)}`
        } else {
          return `${v}`
        }
      })
      .join(' ')
  }

  public override getAppVersion = (): string => {
    const pkgJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'),
    )
    return pkgJson.version
  }

  public override getLogs = () => {
    return readFileSync(this.logFile, 'utf-8')
  }

  public override debug = (...data: any[]): void => {
    const str = this.formatString('DEBUG -', this.getDateTime() + ':', ...data)
    console.info(str)
    appendFileSync(this.fd, `\n${str}`, 'utf-8')
  }

  public override info = (...data: any[]): void => {
    const str = this.formatString('INFO -', this.getDateTime() + ':', ...data)
    console.info(str)
    appendFileSync(this.fd, `\n${str}`, 'utf-8')
  }
  public override warn = (...data: any[]): void => {
    const str = this.formatString('WARN -', this.getDateTime() + ':', ...data)
    console.warn(str)
    appendFileSync(this.fd, `\n${str}`, 'utf-8')
  }
  public override error = (...data: any[]): void => {
    const str = this.formatString('ERROR -', this.getDateTime() + ':', ...data)
    console.error(str)
    appendFileSync(this.fd, `\n${str}`, 'utf-8')
  }

  public override close = () => {
    closeSync(this.fd)
  }
}
