import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, Tray } from 'electron'
import { registerIpcHandlers } from './ipc'
import { registerToggleShortcut, unregisterAllShortcuts } from './shortcuts'
import { getSettings } from './store/settingsStore'
import { createTray } from './tray'
import { createPopupWindow, showPopupWindow, togglePopupWindow } from './windows/popupWindow'

let tray: Tray | null = null
let popupWindow: BrowserWindow | null = null

const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
} else {
  // 二重起動時は既存のポップアップを表示するだけにする
  app.on('second-instance', () => {
    if (popupWindow) showPopupWindow(popupWindow)
  })

  // macOSではDockに常駐アイコンを表示しない(トレイ常駐アプリのため)
  app.dock?.hide()

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.quickrefine.app')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    popupWindow = createPopupWindow()
    tray = createTray(popupWindow)
    registerIpcHandlers(popupWindow)

    const settings = getSettings()
    const registered = registerToggleShortcut(settings.shortcut, () => {
      if (popupWindow) togglePopupWindow(popupWindow)
    })
    if (!registered) {
      console.error(`グローバルショートカットの登録に失敗しました: ${settings.shortcut}`)
    }
  })

  // トレイ常駐アプリのため、ウィンドウが閉じられてもアプリ自体は終了しない
  app.on('window-all-closed', () => {})

  app.on('will-quit', () => {
    unregisterAllShortcuts()
    tray?.destroy()
  })
}
