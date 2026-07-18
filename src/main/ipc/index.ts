import { BrowserWindow, ipcMain } from 'electron'
import { AIProviderId, GenerateRequest, SkillInput } from '../../shared/types'
import { generateText } from '../ai'
import { registerToggleShortcut } from '../shortcuts'
import { getApiKeyStatus, removeApiKey, setApiKey } from '../store/secureKeys'
import { getSettings, updateSettings } from '../store/settingsStore'
import { createSkill, deleteSkill, listSkills, updateSkill } from '../store/skillsStore'
import { togglePopupWindow } from '../windows/popupWindow'

export function registerIpcHandlers(popupWindow: BrowserWindow): void {
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:update', (_event, partial) => updateSettings(partial))

  ipcMain.handle('apiKeys:status', () => getApiKeyStatus())
  ipcMain.handle('apiKeys:set', (_event, provider: AIProviderId, apiKey: string) => {
    setApiKey(provider, apiKey)
    return getApiKeyStatus()
  })
  ipcMain.handle('apiKeys:remove', (_event, provider: AIProviderId) => {
    removeApiKey(provider)
    return getApiKeyStatus()
  })

  ipcMain.handle('skills:list', () => listSkills())
  ipcMain.handle('skills:create', (_event, input: SkillInput) => createSkill(input))
  ipcMain.handle('skills:update', (_event, id: string, input: Partial<SkillInput>) =>
    updateSkill(id, input)
  )
  ipcMain.handle('skills:delete', (_event, id: string) => deleteSkill(id))

  ipcMain.handle('ai:generate', (_event, request: GenerateRequest) => generateText(request))

  ipcMain.handle('shortcut:update', (_event, accelerator: string) => {
    const success = registerToggleShortcut(accelerator, () => togglePopupWindow(popupWindow))
    if (success) {
      updateSettings({ shortcut: accelerator })
    }
    return success
  })

  ipcMain.handle('window:hide', () => {
    popupWindow.hide()
  })
}
