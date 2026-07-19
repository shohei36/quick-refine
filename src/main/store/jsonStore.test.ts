import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readJsonArray, readJsonObject, writeJsonFile } from './jsonStore'

describe('jsonStore', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'quick-refine-test-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('ファイルが存在しない場合はデフォルト値を返す', () => {
    const filePath = join(dir, 'settings.json')
    const result = readJsonObject(filePath, { foo: 'bar' })
    expect(result).toEqual({ foo: 'bar' })
  })

  it('書き込んだ内容を読み込める(存在しないディレクトリも作成する)', () => {
    const filePath = join(dir, 'nested', 'settings.json')
    writeJsonFile(filePath, { foo: 'baz' })
    expect(existsSync(filePath)).toBe(true)

    const result = readJsonObject(filePath, { foo: 'bar' })
    expect(result).toEqual({ foo: 'baz' })
    expect(JSON.parse(readFileSync(filePath, 'utf-8'))).toEqual({ foo: 'baz' })
  })

  it('配列ファイルが存在しない場合はデフォルト値を返す', () => {
    const filePath = join(dir, 'skills.json')
    const result = readJsonArray<string>(filePath, [])
    expect(result).toEqual([])
  })

  it('配列でない値が保存されている場合はデフォルト値を返す', () => {
    const filePath = join(dir, 'skills.json')
    writeJsonFile(filePath, { not: 'an array' })
    const result = readJsonArray(filePath, ['default'])
    expect(result).toEqual(['default'])
  })
})
