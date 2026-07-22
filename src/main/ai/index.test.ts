import { describe, expect, it } from 'vitest'
import { parseSkillDraft } from './index'

describe('parseSkillDraft', () => {
  it('通常のJSON応答をパースできる', () => {
    const raw = JSON.stringify({
      name: '議事録要約',
      description: '会議の議事録を箇条書きで要約する',
      systemPromptTemplate: 'あなたは議事録を要約するアシスタントです。'
    })

    expect(parseSkillDraft(raw)).toEqual({
      name: '議事録要約',
      description: '会議の議事録を箇条書きで要約する',
      systemPromptTemplate: 'あなたは議事録を要約するアシスタントです。'
    })
  })

  it('```json コードフェンス付きの応答からもパースできる', () => {
    const raw = [
      '```json',
      JSON.stringify({
        name: 'メール返信',
        description: '丁寧なビジネスメールの返信文を作成する',
        systemPromptTemplate: 'あなたはビジネスメールの返信を作成するアシスタントです。'
      }),
      '```'
    ].join('\n')

    expect(parseSkillDraft(raw)).toEqual({
      name: 'メール返信',
      description: '丁寧なビジネスメールの返信文を作成する',
      systemPromptTemplate: 'あなたはビジネスメールの返信を作成するアシスタントです。'
    })
  })

  it('前後の空白はtrimされる', () => {
    const raw = JSON.stringify({
      name: '  スキル名  ',
      description: '  説明  ',
      systemPromptTemplate: '  プロンプト  '
    })

    expect(parseSkillDraft(raw)).toEqual({
      name: 'スキル名',
      description: '説明',
      systemPromptTemplate: 'プロンプト'
    })
  })

  it('JSONとして解析できない応答は例外を投げる', () => {
    expect(() => parseSkillDraft('これはJSONではありません')).toThrow()
  })

  it('必要なフィールドが欠けている場合は例外を投げる', () => {
    expect(() => parseSkillDraft(JSON.stringify({ name: 'foo' }))).toThrow()
  })
})
