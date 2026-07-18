import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { togglePopupWindow } from './windows/popupWindow'

export function createTray(popupWindow: BrowserWindow): Tray {
  const iconPath = join(__dirname, '../../resources/icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)
  tray.setToolTip('Quick Refine')

  tray.on('click', () => togglePopupWindow(popupWindow))

  const contextMenu = Menu.buildFromTemplate([
    { label: '表示 / 非表示', click: () => togglePopupWindow(popupWindow) },
    { type: 'separator' },
    { label: '終了', click: () => app.quit() }
  ])
  tray.setContextMenu(contextMenu)

  return tray
}
