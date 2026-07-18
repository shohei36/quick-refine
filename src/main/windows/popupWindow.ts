import { is } from '@electron-toolkit/utils'
import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

const WINDOW_WIDTH = 480
const WINDOW_HEIGHT = 640

export function createPopupWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 360,
    minHeight: 420,
    show: false,
    frame: false,
    resizable: true,
    movable: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  window.on('blur', () => {
    if (!is.dev) {
      window.hide()
    }
  })

  window.on('close', (event) => {
    // トレイ常駐アプリのため、閉じる操作は非表示として扱う
    event.preventDefault()
    window.hide()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // 開発時はショートカットを押さなくても内容を確認できるよう自動的に表示する
    window.on('ready-to-show', () => {
      showPopupWindow(window)
      window.webContents.openDevTools({ mode: 'detach' })
    })
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

function positionNearCursor(window: BrowserWindow): void {
  const cursorPoint = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursorPoint)
  const { x, y, width, height } = display.workArea
  const [winWidth, winHeight] = window.getSize()
  const posX = Math.round(x + (width - winWidth) / 2)
  const posY = Math.round(y + (height - winHeight) / 2)
  window.setPosition(posX, posY)
}

export function showPopupWindow(window: BrowserWindow): void {
  positionNearCursor(window)
  window.show()
  window.focus()
}

export function togglePopupWindow(window: BrowserWindow): void {
  if (window.isVisible()) {
    window.hide()
  } else {
    showPopupWindow(window)
  }
}
