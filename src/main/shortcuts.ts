import { globalShortcut } from 'electron'

let currentAccelerator: string | null = null

export function registerToggleShortcut(accelerator: string, callback: () => void): boolean {
  if (currentAccelerator) {
    globalShortcut.unregister(currentAccelerator)
    currentAccelerator = null
  }

  const success = globalShortcut.register(accelerator, callback)
  if (success) {
    currentAccelerator = accelerator
  }
  return success
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
  currentAccelerator = null
}
