import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'

export function readJsonObject<T extends object>(filePath: string, defaultValue: T): T {
  try {
    if (!existsSync(filePath)) return defaultValue
    const raw = readFileSync(filePath, 'utf-8')
    return { ...defaultValue, ...JSON.parse(raw) }
  } catch (error) {
    console.error(`Failed to read JSON file at ${filePath}:`, error)
    return defaultValue
  }
}

export function readJsonArray<T>(filePath: string, defaultValue: T[]): T[] {
  try {
    if (!existsSync(filePath)) return defaultValue
    const raw = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultValue
  } catch (error) {
    console.error(`Failed to read JSON file at ${filePath}:`, error)
    return defaultValue
  }
}

export function writeJsonFile<T>(filePath: string, value: T): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8')
}
