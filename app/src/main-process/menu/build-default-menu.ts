import { Menu, ipcMain, shell, app } from 'electron'
import { ensureItemIds } from './ensure-item-ids'
import { MenuEvent } from './menu-event'
import { truncateWithEllipsis } from '../../lib/truncate-with-ellipsis'
import { getLogDirectoryPath } from '../../lib/logging/get-log-path'
import { ensureDir } from 'fs-extra'

import { log } from '../log'
import { openDirectorySafe } from '../shell'

const defaultEditorLabel = __DARWIN__
  ? 'Open in External Editor'
  : '開啟外部編輯器'
const defaultShellLabel = __DARWIN__
  ? 'Open in Terminal'
  : '開啟命令提示字元'
const defaultPullRequestLabel = __DARWIN__
  ? 'Create Pull Request'
  : '建立拉取請求(&P)'
const defaultBranchNameDefaultValue = __DARWIN__
  ? 'Default Branch'
  : '預設分支'

export type MenuLabels = {
  editorLabel?: string
  shellLabel?: string
  pullRequestLabel?: string
  defaultBranchName?: string
}

export function buildDefaultMenu({
  editorLabel = defaultEditorLabel,
  shellLabel = defaultShellLabel,
  pullRequestLabel = defaultPullRequestLabel,
  defaultBranchName = defaultBranchNameDefaultValue,
}: MenuLabels): Electron.Menu {
  defaultBranchName = truncateWithEllipsis(defaultBranchName, 25)

  const template = new Array<Electron.MenuItemConstructorOptions>()
  const separator: Electron.MenuItemConstructorOptions = { type: 'separator' }

  if (__DARWIN__) {
    template.push({
      label: 'GitHub Desktop',
      submenu: [
        {
          label: '關於 GitHub Desktop',
          click: emit('show-about'),
          id: 'about',
        },
        separator,
        {
          label: '喜好…',
          id: 'preferences',
          accelerator: 'CmdOrCtrl+,',
          click: emit('show-preferences'),
        },
        separator,
        {
          label: '安裝命令行工具…',
          id: 'install-cli',
          click: emit('install-cli'),
        },
        separator,
        {
          role: '服務',
          submenu: [],
        },
        separator,
        { role: '隱藏' },
        { role: '隱藏其他' },
        { role: '取消隱藏' },
        separator,
        { role: '放棄' },
      ],
    })
  }

  const fileMenu: Electron.MenuItemConstructorOptions = {
    label: __DARWIN__ ? 'File' : '檔案(&F)',
    submenu: [
      {
        label: __DARWIN__ ? 'New Repository…' : '新的存儲庫(&R)…',
        id: 'new-repository',
        click: emit('create-repository'),
        accelerator: 'CmdOrCtrl+N',
      },
      separator,
      {
        label: __DARWIN__ ? 'Add Local Repository…' : '增加本機存儲庫(&L)…',
        id: 'add-local-repository',
        accelerator: 'CmdOrCtrl+O',
        click: emit('add-local-repository'),
      },
      {
        label: __DARWIN__ ? 'Clone Repository…' : '克隆存儲庫(&N)…',
        id: 'clone-repository',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: emit('clone-repository'),
      },
    ],
  }

  if (!__DARWIN__) {
    const fileItems = fileMenu.submenu as Electron.MenuItemConstructorOptions[]

    fileItems.push(
      separator,
      {
        label: '選項(&O)…',
        id: 'preferences',
        accelerator: 'CmdOrCtrl+,',
        click: emit('show-preferences'),
      },
      separator,
      { role: 'quit', label: '離開(&E)'}
    )
  }

  template.push(fileMenu)

  template.push({
    label: __DARWIN__ ? 'Edit' : '編輯(&E)',
    submenu: [
      { role: 'undo', label: __DARWIN__ ? 'Undo' : '取消(&U)' },
      { role: 'redo', label: __DARWIN__ ? 'Redo' : '重做(&R)' },
      separator,
      { role: 'cut', label: __DARWIN__ ? 'Cut' : '剪下(&T)' },
      { role: 'copy', label: __DARWIN__ ? 'Copy' : '複製(&C)' },
      { role: 'paste', label: __DARWIN__ ? 'Paste' : '貼上(&P)' },
      {
        label: __DARWIN__ ? 'Select All' : '全選(&A)',
        accelerator: 'CmdOrCtrl+A',
        click: emit('select-all'),
      },
    ],
  })

  template.push({
    label: __DARWIN__ ? 'View' : '檢視(&V)',
    submenu: [
      {
        label: __DARWIN__ ? 'Show Changes' : '變更(&C)',
        id: 'show-changes',
        accelerator: 'CmdOrCtrl+1',
        click: emit('show-changes'),
      },
      {
        label: __DARWIN__ ? 'Show History' : '歷史(&H)',
        id: 'show-history',
        accelerator: 'CmdOrCtrl+2',
        click: emit('show-history'),
      },
      {
        label: __DARWIN__ ? 'Show Repository List' : '存儲庫清單(&L)',
        id: 'show-repository-list',
        accelerator: 'CmdOrCtrl+T',
        click: emit('choose-repository'),
      },
      {
        label: __DARWIN__ ? 'Show Branches List' : '分支清單(&B)',
        id: 'show-branches-list',
        accelerator: 'CmdOrCtrl+B',
        click: emit('show-branches'),
      },
      separator,
      {
        label: __DARWIN__ ? 'Go to Summary' : '至摘要(&S)',
        id: 'go-to-commit-message',
        accelerator: 'CmdOrCtrl+G',
        click: emit('go-to-commit-message'),
      },
      {
        label: __DARWIN__ ? 'Toggle Full Screen' : '切換全螢幕(&F)',
        role: 'togglefullscreen',
      },
      separator,
      {
        label: __DARWIN__ ? 'Reset Zoom' : '重設縮放',
        accelerator: 'CmdOrCtrl+0',
        click: zoom(ZoomDirection.Reset),
      },
      {
        label: __DARWIN__ ? 'Zoom In' : '放大',
        accelerator: 'CmdOrCtrl+=',
        click: zoom(ZoomDirection.In),
      },
      {
        label: __DARWIN__ ? 'Zoom Out' : '縮小',
        accelerator: 'CmdOrCtrl+-',
        click: zoom(ZoomDirection.Out),
      },
      separator,
      {
        label: '重新啟動(&R)',
        id: 'reload-window',
        // Ctrl+Alt is interpreted as AltGr on international keyboards and this
        // can clash with other shortcuts. We should always use Ctrl+Shift for
        // chorded shortcuts, but this menu item is not a user-facing feature
        // so we are going to keep this one around.
        accelerator: 'CmdOrCtrl+Alt+R',
        click(item: any, focusedWindow: Electron.BrowserWindow) {
          if (focusedWindow) {
            focusedWindow.reload()
          }
        },
        visible: __RELEASE_CHANNEL__ === 'development',
      },
      {
        id: 'show-devtools',
        label: __DARWIN__
          ? 'Toggle Developer Tools'
          : '切換開發者工具(&T)',
        accelerator: (() => {
          return __DARWIN__ ? 'Alt+Command+I' : 'Ctrl+Shift+I'
        })(),
        click(item: any, focusedWindow: Electron.BrowserWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools()
          }
        },
      },
    ],
  })

  template.push({
    label: __DARWIN__ ? 'Repository' : '存儲庫(&R)',
    id: 'repository',
    submenu: [
      {
        id: 'push',
        label: __DARWIN__ ? 'Push' : '推送(&U)',
        accelerator: 'CmdOrCtrl+P',
        click: emit('push'),
      },
      {
        id: 'pull',
        label: __DARWIN__ ? 'Pull' : '拉取(&L)',
        accelerator: 'CmdOrCtrl+Shift+P',
        click: emit('pull'),
      },
      {
        label: __DARWIN__ ? 'Remove' : '清除(&R)',
        id: 'remove-repository',
        accelerator: 'CmdOrCtrl+Delete',
        click: emit('remove-repository'),
      },
      separator,
      {
        id: 'view-repository-on-github',
        label: __DARWIN__ ? 'View on GitHub' : '在 GitHub 上檢視(&V)',
        accelerator: 'CmdOrCtrl+Shift+G',
        click: emit('view-repository-on-github'),
      },
      {
        label: shellLabel,
        id: 'open-in-shell',
        accelerator: 'Ctrl+`',
        click: emit('open-in-shell'),
      },
      {
        label: __DARWIN__ ? 'Show in Finder' : '在資源管理器上顯示(E&)',
        id: 'open-working-directory',
        accelerator: 'CmdOrCtrl+Shift+F',
        click: emit('open-working-directory'),
      },
      {
        label: editorLabel,
        id: 'open-external-editor',
        accelerator: 'CmdOrCtrl+Shift+A',
        click: emit('open-external-editor'),
      },
      separator,
      {
        label: __DARWIN__ ? 'Repository Settings…' : '存儲庫設定(&S)…',
        id: 'show-repository-settings',
        click: emit('show-repository-settings'),
      },
    ],
  })

  template.push({
    label: __DARWIN__ ? 'Branch' : '分支(&B)',
    id: 'branch',
    submenu: [
      {
        label: __DARWIN__ ? 'New Branch…' : '新分支(&B)…',
        id: 'create-branch',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: emit('create-branch'),
      },
      {
        label: __DARWIN__ ? 'Rename…' : '重新命名(&R)…',
        id: 'rename-branch',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: emit('rename-branch'),
      },
      {
        label: __DARWIN__ ? 'Delete…' : '刪除(&D)…',
        id: 'delete-branch',
        accelerator: 'CmdOrCtrl+Shift+D',
        click: emit('delete-branch'),
      },
      separator,
      {
        label: __DARWIN__
          ? `Update From ${defaultBranchName}`
          : `更新自 ${defaultBranchName}(&U)`,
        id: 'update-branch',
        accelerator: 'CmdOrCtrl+Shift+U',
        click: emit('update-branch'),
      },
      {
        label: __DARWIN__ ? 'Compare to Branch' : '比較分支(&C)',
        id: 'compare-to-branch',
        accelerator: 'CmdOrCtrl+Shift+B',
        click: emit('compare-to-branch'),
      },
      {
        label: __DARWIN__
          ? 'Merge Into Current Branch…'
          : '合併到現在的分支(&M)…',
        id: 'merge-branch',
        accelerator: 'CmdOrCtrl+Shift+M',
        click: emit('merge-branch'),
      },
      separator,
      {
        label: __DARWIN__ ? 'Compare on GitHub' : 'GitHub 上比較(&G)',
        id: 'compare-on-github',
        accelerator: 'CmdOrCtrl+Shift+C',
        click: emit('compare-on-github'),
      },
      {
        label: pullRequestLabel,
        id: 'create-pull-request',
        accelerator: 'CmdOrCtrl+R',
        click: emit('open-pull-request'),
      },
    ],
  })

  if (__DARWIN__) {
    template.push({
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
        separator,
        { role: 'front' },
      ],
    })
  }

  const submitIssueItem: Electron.MenuItemConstructorOptions = {
    label: __DARWIN__ ? 'Report Issue…' : '報告問題…',
    click() {
      shell.openExternal('https://github.com/desktop/desktop/issues/new/choose')
    },
  }

  const contactSupportItem: Electron.MenuItemConstructorOptions = {
    label: __DARWIN__ ? 'Contact GitHub Support…' : '聯絡 GitHub 支援(&C)…',
    click() {
      shell.openExternal(
        `https://github.com/contact?from_desktop_app=1&app_version=${app.getVersion()}`
      )
    },
  }

  const showUserGuides: Electron.MenuItemConstructorOptions = {
    label: '顯示使用者指南',
    click() {
      shell.openExternal('https://help.github.com/desktop/guides/')
    },
  }

  const showLogsLabel = __DARWIN__
    ? 'Show Logs in Finder'
    : __WIN32__
    ? '顯示資源管理器中的日誌(&H)'
    : '顯示檔案管理器中的日誌(&H)'

  const showLogsItem: Electron.MenuItemConstructorOptions = {
    label: showLogsLabel,
    click() {
      const logPath = getLogDirectoryPath()
      ensureDir(logPath)
        .then(() => {
          openDirectorySafe(logPath)
        })
        .catch(err => {
          log('error', err.message)
        })
    },
  }

  const helpItems = [
    submitIssueItem,
    contactSupportItem,
    showUserGuides,
    showLogsItem,
  ]

  if (__DEV__) {
    helpItems.push(
      separator,
      {
        label: '崩潰的主要過程…',
        click() {
          throw new Error('Boomtown!')
        },
      },
      {
        label: '崩潰的渲染器過程…',
        click: emit('boomtown'),
      },
      {
        label: 'Show popup',
        submenu: [
          {
            label: 'Release notes',
            click: emit('show-release-notes-popup'),
          },
        ],
      }
    )
  }

  if (__DARWIN__) {
    template.push({
      role: 'help',
      submenu: helpItems,
    })
  } else {
    template.push({
      label: '說明(&H)',
      submenu: [
        ...helpItems,
        separator,
        {
          label: '關於 GitHub Desktop(&A)',
          click: emit('show-about'),
          id: 'about',
        },
      ],
    })
  }

  ensureItemIds(template)

  return Menu.buildFromTemplate(template)
}

type ClickHandler = (
  menuItem: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow,
  event: Electron.Event
) => void

/**
 * Utility function returning a Click event handler which, when invoked, emits
 * the provided menu event over IPC.
 */
function emit(name: MenuEvent): ClickHandler {
  return (menuItem, window) => {
    if (window) {
      window.webContents.send('menu-event', { name })
    } else {
      ipcMain.emit('menu-event', { name })
    }
  }
}

enum ZoomDirection {
  Reset,
  In,
  Out,
}

/** The zoom steps that we support, these factors must sorted */
const ZoomInFactors = [1, 1.1, 1.25, 1.5, 1.75, 2]
const ZoomOutFactors = ZoomInFactors.slice().reverse()

/**
 * Returns the element in the array that's closest to the value parameter. Note
 * that this function will throw if passed an empty array.
 */
function findClosestValue(arr: Array<number>, value: number) {
  return arr.reduce((previous, current) => {
    return Math.abs(current - value) < Math.abs(previous - value)
      ? current
      : previous
  })
}

/**
 * Figure out the next zoom level for the given direction and alert the renderer
 * about a change in zoom factor if necessary.
 */
function zoom(direction: ZoomDirection): ClickHandler {
  return (menuItem, window) => {
    if (!window) {
      return
    }

    const { webContents } = window

    if (direction === ZoomDirection.Reset) {
      webContents.setZoomFactor(1)
      webContents.send('zoom-factor-changed', 1)
    } else {
      webContents.getZoomFactor(rawZoom => {
        const zoomFactors =
          direction === ZoomDirection.In ? ZoomInFactors : ZoomOutFactors

        // So the values that we get from getZoomFactor are floating point
        // precision numbers from chromium that don't always round nicely so
        // we'll have to do a little trick to figure out which of our supported
        // zoom factors the value is referring to.
        const currentZoom = findClosestValue(zoomFactors, rawZoom)

        const nextZoomLevel = zoomFactors.find(f =>
          direction === ZoomDirection.In ? f > currentZoom : f < currentZoom
        )

        // If we couldn't find a zoom level (likely due to manual manipulation
        // of the zoom factor in devtools) we'll just snap to the closest valid
        // factor we've got.
        const newZoom =
          nextZoomLevel === undefined ? currentZoom : nextZoomLevel

        webContents.setZoomFactor(newZoom)
        webContents.send('zoom-factor-changed', newZoom)
      })
    }
  }
}
