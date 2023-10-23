import { runGov4Git } from '@gov4git/js-client'

import { parseStdout } from '../lib/stdout.js'
import { LogService } from './LogService.js'
import { Services } from './Services.js'

export class Gov4GitService {
  protected declare configPath: string
  protected declare services: Services
  protected declare log: LogService

  constructor(services: Services) {
    this.configPath = ''
    this.services = services
    this.log = this.services.load<LogService>('log')
  }

  public setConfigPath = (configPath: string): void => {
    this.configPath = configPath
  }

  public mustRun = async <T>(...command: string[]): Promise<T> => {
    if (this.configPath !== '') {
      command.push('--config', this.configPath)
    }

    let results: { stdout: string; stderr: string }
    try {
      results = await runGov4Git(...command)
    } catch (ex) {
      this.log.error('Exception running Gov4Git')
      this.log.error(`Command: ${command.join(' ')}`)
      this.log.error(ex)
      throw ex
    }
    this.log.info('Running Gov4Git')
    this.log.info(`Command: ${command.join(' ')}`)
    if (results.stderr != null && results.stderr.trim() !== '') {
      this.log.error('Gov4Git Error')
      this.log.error(`Error: ${results.stderr}`)
      throw new Error(results.stderr)
    }
    const output = parseStdout<T>(command, results.stdout)
    this.log.info('Gov4Git Response:', output)
    return output
  }
}
