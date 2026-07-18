import { app } from 'electron'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { Skill, SkillInput } from '../../shared/types'
import presetSkillsData from '../../../resources/presetSkills.json'
import { readJsonArray, writeJsonFile } from './jsonStore'

const presetSkills = presetSkillsData as Skill[]

const skillsPath = (): string => join(app.getPath('userData'), 'skills.json')

function loadUserSkills(): Skill[] {
  return readJsonArray<Skill>(skillsPath(), [])
}

function saveUserSkills(skills: Skill[]): void {
  writeJsonFile(skillsPath(), skills)
}

export function listSkills(): Skill[] {
  return [...presetSkills, ...loadUserSkills()]
}

export function createSkill(input: SkillInput): Skill {
  const now = Date.now()
  const skill: Skill = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    systemPromptTemplate: input.systemPromptTemplate,
    isPreset: false,
    createdAt: now,
    updatedAt: now
  }
  const skills = loadUserSkills()
  skills.push(skill)
  saveUserSkills(skills)
  return skill
}

export function updateSkill(id: string, input: Partial<SkillInput>): Skill {
  const skills = loadUserSkills()
  const index = skills.findIndex((skill) => skill.id === id)
  if (index === -1) {
    throw new Error(
      '編集可能なユーザー定義スキルが見つかりません(プリセットスキルは編集できません)'
    )
  }
  const updated: Skill = { ...skills[index], ...input, updatedAt: Date.now() }
  skills[index] = updated
  saveUserSkills(skills)
  return updated
}

export function deleteSkill(id: string): Skill[] {
  const skills = loadUserSkills()
  const next = skills.filter((skill) => skill.id !== id)
  if (next.length === skills.length) {
    throw new Error(
      '削除可能なユーザー定義スキルが見つかりません(プリセットスキルは削除できません)'
    )
  }
  saveUserSkills(next)
  return listSkills()
}
