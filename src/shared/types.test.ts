import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, MODEL_OPTIONS, getModelOptions } from './types'

describe('getModelOptions', () => {
  it('プリセットに含まれる値はそのままプリセット一覧を返す', () => {
    const options = getModelOptions('anthropic', MODEL_OPTIONS.anthropic[0])
    expect(options).toEqual(MODEL_OPTIONS.anthropic)
  })

  it('プリセットに含まれない現在値は末尾に追加して返す', () => {
    const options = getModelOptions('openai', 'custom-model-id')
    expect(options).toEqual([...MODEL_OPTIONS.openai, 'custom-model-id'])
  })
})

describe('DEFAULT_SETTINGS', () => {
  it('全プロバイダー分のデフォルトモデルを持つ', () => {
    expect(Object.keys(DEFAULT_SETTINGS.models).sort()).toEqual(Object.keys(MODEL_OPTIONS).sort())
  })

  it('デフォルトモデルはそれぞれのプリセット一覧に含まれる', () => {
    for (const [provider, model] of Object.entries(DEFAULT_SETTINGS.models)) {
      expect(MODEL_OPTIONS[provider as keyof typeof MODEL_OPTIONS]).toContain(model)
    }
  })
})
