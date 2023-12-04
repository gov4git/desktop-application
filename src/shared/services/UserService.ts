import { type FullUser } from '../../electron/db/schema.js'

export abstract class AbstractUserService {
  public abstract authenticate(username: string, pat: string): Promise<string[]>
  public abstract getUser(): Promise<FullUser | null>
}
