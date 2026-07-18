import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import type {
  AIProviderId,
  ApiKeyStatus,
  AppSettings,
  GenerateRequest,
  GenerateResult,
  Skill,
  SkillInput
} from '../shared/types'

// Custom APIs for renderer
const api = {
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    update: (partial: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke('settings:update', partial)
  },
  apiKeys: {
    status: (): Promise<ApiKeyStatus> => ipcRenderer.invoke('apiKeys:status'),
    set: (provider: AIProviderId, apiKey: string): Promise<ApiKeyStatus> =>
      ipcRenderer.invoke('apiKeys:set', provider, apiKey),
    remove: (provider: AIProviderId): Promise<ApiKeyStatus> =>
      ipcRenderer.invoke('apiKeys:remove', provider)
  },
  skills: {
    list: (): Promise<Skill[]> => ipcRenderer.invoke('skills:list'),
    create: (input: SkillInput): Promise<Skill> => ipcRenderer.invoke('skills:create', input),
    update: (id: string, input: Partial<SkillInput>): Promise<Skill> =>
      ipcRenderer.invoke('skills:update', id, input),
    delete: (id: string): Promise<Skill[]> => ipcRenderer.invoke('skills:delete', id)
  },
  ai: {
    generate: (request: GenerateRequest): Promise<GenerateResult> =>
      ipcRenderer.invoke('ai:generate', request)
  },
  shortcut: {
    update: (accelerator: string): Promise<boolean> =>
      ipcRenderer.invoke('shortcut:update', accelerator)
  },
  window: {
    hide: (): Promise<void> => ipcRenderer.invoke('window:hide')
  }
}

export type Api = typeof api

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
