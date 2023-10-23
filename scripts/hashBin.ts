import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import yaml from 'js-yaml'

const [binFile, yamlFile] = process.argv.slice(2)

if (binFile == null || yamlFile == null) {
  throw new Error(`Missing arguments, binFile and/or yamlFile`)
}

const binFilePath = resolve(process.cwd(), binFile)
const yamlFilePath = resolve(process.cwd(), yamlFile)

if (!existsSync(binFilePath) || !existsSync(yamlFilePath)) {
  throw new Error(
    `File paths do not exist, binFile and/or yamlFile: ${binFilePath}, ${yamlFilePath}`,
  )
}

const binFileContents = readFileSync(binFilePath)
const binFileStats = statSync(binFilePath)
const yamlFileContents = yaml.load(
  readFileSync(yamlFilePath, 'utf-8'),
) as Record<string, any>

console.log('===== Current Hash File =====')
console.log(yamlFileContents)

const hash = createHash('sha512')
const data = hash.update(binFileContents)

const base64Hash = data.digest('base64')

yamlFileContents.sha512 = base64Hash
yamlFileContents.files[0].sha512 = base64Hash
yamlFileContents.files[0].size = binFileStats.size
const newYamlContents = yaml.dump(yamlFileContents, { lineWidth: -1 })

console.log(`====== New Hash File: ${yamlFilePath} ======`)
console.log(newYamlContents)

writeFileSync(yamlFilePath, newYamlContents, 'utf-8')
