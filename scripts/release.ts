import { exec } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

import { glob } from 'glob'

const execAsync = promisify(exec)

async function run() {
  const [tag, directory] = process.argv.slice(2)
  if (tag == null || tag === '' || directory == null || directory === '') {
    throw new Error(`Missing arguments, tag and/or directory`)
  }

  const filePatterns = [
    '**/*.exe',
    '**/*.blockmap',
    '**/latest.yml',
    '**/latest-*.yml',
    '**/*.AppImage',
    '**/*.dmg',
    '**/*.zip',
  ]
  const location = resolve(process.cwd(), directory)
  const files = (await glob(filePatterns, { cwd: location })).map((f) =>
    resolve(location, f),
  )
  const command = `gh release upload ${tag} -R gov4git/desktop-application --clobber ${files.join(
    ' ',
  )}`
  console.log('===== Running =====')
  console.log(command)
  const { stdout, stderr } = await execAsync(command)
  if (stderr != null && stderr !== '') {
    throw stderr
  }
  console.log(stdout)
}

run().catch((er) => {
  console.error(er)
  process.exit(1)
})
