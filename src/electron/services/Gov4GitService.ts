import { runGov4Git } from '@gov4git/js-client'
import { eq } from 'drizzle-orm'
import { existsSync } from 'fs'

import { DB } from '../db/db.js'
import { communities } from '../db/schema.js'
import { parseStdout } from '../lib/stdout.js'
import { LogService } from './LogService.js'
import { Services } from './Services.js'

export class Gov4GitService {
  protected declare readonly services: Services
  protected declare readonly log: LogService
  protected declare readonly db: DB

  constructor(services: Services) {
    this.services = services
    this.log = this.services.load<LogService>('log')
    this.db = this.services.load<DB>('db')
  }

  private checkConfigPath = (configPath: string) => {
    if (!existsSync(configPath)) {
      throw new Error(
        `Unable to run Gov4Git command as config ${configPath} does not exist`,
      )
    }
  }

  private getConfigPath = async (): Promise<string> => {
    const selectedCommunity = (
      await this.db
        .select()
        .from(communities)
        .where(eq(communities.selected, true))
        .limit(1)
    )[0]

    if (selectedCommunity == null) {
      throw new Error(
        `Unable to run Gov4Git command as config is not provided.`,
      )
    }

    this.checkConfigPath(selectedCommunity.configPath)

    return selectedCommunity.configPath
  }

  public mustRun = async <T>(
    command: string[],
    configPath?: string,
  ): Promise<T> => {
    try {
      if (configPath != null) {
        this.checkConfigPath(configPath)
      } else {
        configPath = await this.getConfigPath()
      }
    } catch (ex) {
      throw new Error(
        `Failed to run Gov4Git command ${command.join(' ')}. ${ex}`,
      )
    }

    command.push('--config', configPath)

    command.push('-v')

    try {
      const { stdout, stderr } = await runGov4Git(...command)
      this.log.info('Running Gov4Git')
      this.log.info(`Command: ${command.join(' ')}`)
      this.log.info('Gov4Git Logs:', stderr)
      const output = parseStdout<T>(command, stdout)
      this.log.info('Gov4Git Response:', output)
      return output
    } catch (ex: any) {
      if (!command.includes('track')) {
        this.log.error('Exception running Gov4Git')
        this.log.error(`Command: ${command.join(' ')}`)
        this.log.error(ex.stderr)
      }
      throw ex
    }
  }
}
