import { Menu, ipcMain, shell, app } from 'electron'
import { ensureItemIds } from './ensure-item-ids'
import { MenuEvent } from './menu-event'
import { truncateWithEllipsis } from '../../lib/truncate-with-ellipsis'
import { getLogDirectoryPath } from '../../lib/logging/get-log-path'
import { ensureDir } from 'fs-extra'
import { openDirectorySafe } from '../shell'
import { enableRebaseDialog, enableStashing } from '../../lib/feature-flag'
import { MenuLabelsEvent } from '../../models/menu-labels'
import { DefaultEditorLabel } from '../../ui/lib/context-menu'

const defaultShellLabel = __DARWIN__
  ? '開啟終端機'
  : '開啟命令提示字元'
const createPullRequestLabel = __DARWIN__
  ? '建立拉取請求'
  : '建立拉取請求(&P)'
const showPullRequestLabel = __DARWIN__
  ? '顯示拉取請求'
  : '顯示拉取請求(&P)'
const defaultBranchNameValue = __DARWIN__ ? '預設分支' : '預設分支'
const confirmRepositoryRemovalLabel = __DARWIN__ ? '清除…' : '清除(&R)…'
const repositoryRemovalLabel = __DARWIN__ ? '清除' : '清除(&R)'

enum ZoomDirection {
  Reset,
  In,
  Out,
}

export function buildDefaultMenu({
  selectedExternalEditor,
  selectedShell,
  askForConfirmationOnForcePush,
  askForConfirmationOnRepositoryRemoval,
  hasCurrentPullRequest = false,
  defaultBranchName = defaultBranchNameValue,
  isForcePushForCurrentRepository = false,
  isStashedChangesVisible = false,
}: MenuLabelsEvent): Electron.Menu {
  defaultBranchName = truncateWithEllipsis(defaultBranchName, 25)

  const removeRepoLabel = askForConfirmationOnRepositoryRemoval
    ? confirmRepositoryRemovalLabel
    : repositoryRemovalLabel

  const pullRequestLabel = hasCurrentPullRequest
    ? showPullRequestLabel
    : createPullRequestLabel

  const shellLabel =
    selectedShell === null ? defaultShellLabel : `開啟 ${selectedShell}`

  const editorLabel =
    selectedExternalEditor === null
      ? DefaultEditorLabel
      : `開啟 ${selectedExternalEditor}`

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
          role: 'services',
          submenu: [],
        },
        separator,
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        separator,
        { role: 'quit' },
      ],
    })
  }

  const fileMenu: Electron.MenuItemConstructorOptions = {
    label: __DARWIN__ ? '檔案' : '檔案(&F)',
    submenu: [
      {
        label: __DARWIN__ ? '新的存儲庫…' : '新的存儲庫(&R)…',
        id: 'new-repository',
        click: emit('create-repository'),
        accelerator: 'CmdOrCtrl+N',
      },
      separator,
      {
        label: __DARWIN__ ? '增加本機存儲庫…' : '增加本機存儲庫(&L)…',
        id: 'add-local-repository',
        accelerator: 'CmdOrCtrl+O',
        click: emit('add-local-repository'),
      },
      {
        label: __DARWIN__ ? '克隆存儲庫…' : '克隆存儲庫(&N)…',
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
      {
        role: 'quit',
        label: '離開(&X)',
        accelerator: 'Alt+F4',
      }
    )
  }

  template.push(fileMenu)

  template.push({
    label: __DARWIN__ ? '編輯' : '編輯(&E)',
    submenu: [
      { role: 'undo', label: __DARWIN__ ? '取消' : '取消(&U)' },
      { role: 'redo', label: __DARWIN__ ? '重做' : '重做(&R)' },
      separator,
      { role: 'cut', label: __DARWIN__ ? '剪下' : '剪下(&T)' },
      { role: 'copy', label: __DARWIN__ ? '複製' : '複製(&C)' },
      { role: 'paste', label: __DARWIN__ ? '貼上' : '貼上(&P)' },
      {
        label: __DARWIN__ ? '全選' : '全選(&A)',
        accelerator: 'CmdOrCtrl+A',
        click: emit('select-all'),
      },
      separator,
      {
        id: 'find',
        label: __DARWIN__ ? '搜尋' : '搜尋(&F)',
        accelerator: 'CmdOrCtrl+F',
        click: emit('find-text'),
      },
    ],
  })

  template.push({
    label: __DARWIN__ ? '檢視' : '檢視(&V)',
    submenu: [
      {
        label: __DARWIN__ ? '顯示變更' : '變更(&C)',
        id: 'show-changes',
        accelerator: 'CmdOrCtrl+1',
        click: emit('show-changes'),
      },
      {
        label: __DARWIN__ ? '顯示歷程' : '歷程(&H)',
        id: 'show-history',
        accelerator: 'CmdOrCtrl+2',
        click: emit('show-history'),
      },
      {
        label: __DARWIN__ ? '顯示存儲庫清單' : '存儲庫清單(&L)',
        id: 'show-repository-list',
        accelerator: 'CmdOrCtrl+T',
        click: emit('choose-repository'),
      },
      {
        label: __DARWIN__ ? '顯示分支清單' : '分支清單(&B)',
        id: 'show-branches-list',
        accelerator: 'CmdOrCtrl+B',
        click: emit('show-branches'),
      },
      separator,
      {
        label: __DARWIN__ ? '至摘要' : '至摘要(&S)',
        id: 'go-to-commit-message',
        accelerator: 'CmdOrCtrl+G',
        click: emit('go-to-commit-message'),
      },
      {
        label: getStashedChangesLabel(isStashedChangesVisible),
        id: 'toggle-stashed-changes',
        accelerator: 'Ctrl+H',
        click: isStashedChangesVisible
          ? emit('hide-stashed-changes')
          : emit('show-stashed-changes'),
        visible: enableStashing(),
      },
      {
        label: __DARWIN__ ? '切換全螢幕' : '切換全螢幕(&F)',
        role: 'togglefullscreen',
      },
      separator,
      {
        label: __DARWIN__ ? '重設縮放' : '重設縮放',
        accelerator: 'CmdOrCtrl+0',
        click: zoom(ZoomDirection.Reset),
      },
      {
        label: __DARWIN__ ? '放大' : '放大',
        accelerator: 'CmdOrCtrl+=',
        click: zoom(ZoomDirection.In),
      },
      {
        label: __DARWIN__ ? '縮小' : '縮小',
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
          ? '切換開發者工具'
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

  const pushLabel = getPushLabel(
    isForcePushForCurrentRepository,
    askForConfirmationOnForcePush
  )

  const pushEventType = isForcePushForCurrentRepository ? 'force-push' : 'push'

  template.push({
    label: __DARWIN__ ? '存儲庫' : '存儲庫(&R)',
    id: 'repository',
    submenu: [
      {
        id: 'push',
        label: pushLabel,
        accelerator: 'CmdOrCtrl+P',
        click: emit(pushEventType),
      },
      {
        id: 'pull',
        label: __DARWIN__ ? '拉取' : '拉取(&L)',
        accelerator: 'CmdOrCtrl+Shift+P',
        click: emit('pull'),
      },
      {
        label: removeRepoLabel,
        id: 'remove-repository',
        accelerator: 'CmdOrCtrl+Backspace',
        click: emit('remove-repository'),
      },
      separator,
      {
        id: 'view-repository-on-github',
        label: __DARWIN__ ? '在 GitHub 上檢視' : '在 GitHub 上檢視(&V)',
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
        label: __DARWIN__
          ? '在 Finder 中顯示'
          : __WIN32__
          ? '在檔案管理器中顯示(&X)'
          : '在檔案管理器中顯示',
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
        label: __DARWIN__ ? '存儲庫設定…' : '存儲庫設定(&S)…',
        id: 'show-repository-settings',
        click: emit('show-repository-settings'),
      },
    ],
  })

  template.push({
    label: __DARWIN__ ? '分支' : '分支(&B)',
    id: 'branch',
    submenu: [
      {
        label: __DARWIN__ ? '新分支…' : '新分支(&B)…',
        id: 'create-branch',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: emit('create-branch'),
      },
      {
        label: __DARWIN__ ? '重新命名…' : '重新命名(&R)…',
        id: 'rename-branch',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: emit('rename-branch'),
      },
      {
        label: __DARWIN__ ? '刪除…' : '刪除(&D)…',
        id: 'delete-branch',
        accelerator: 'CmdOrCtrl+Shift+D',
        click: emit('delete-branch'),
      },
      separator,
      {
        label: __DARWIN__ ? '放棄全部變更…' : '放棄全部變更…',
        id: 'discard-all-changes',
        accelerator: 'CmdOrCtrl+Shift+Backspace',
        click: emit('discard-all-changes'),
      },
      separator,
      {
        label: __DARWIN__
          ? `更新自 ${defaultBranchName}`
          : `更新自 ${defaultBranchName}(&U)`,
        id: 'update-branch',
        accelerator: 'CmdOrCtrl+Shift+U',
        click: emit('update-branch'),
      },
      {
        label: __DARWIN__ ? '比較分支' : '比較分支(&C)',
        id: 'compare-to-branch',
        accelerator: 'CmdOrCtrl+Shift+B',
        click: emit('compare-to-branch'),
      },
      {
        label: __DARWIN__
          ? '合併到現在的分支…'
          : '合併到現在的分支(&M)…',
        id: 'merge-branch',
        accelerator: 'CmdOrCtrl+Shift+M',
        click: emit('merge-branch'),
      },
      {
        label: __DARWIN__
          ? '變基當前分支…'
          : '變基當前分支(&R)…',
        id: 'rebase-branch',
        accelerator: 'CmdOrCtrl+Shift+E',
        click: emit('rebase-branch'),
        visible: enableRebaseDialog(),
      },
      separator,
      {
        label: __DARWIN__ ? 'GitHub 上比較' : 'GitHub 上比較(&G)',
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
    label: __DARWIN__ ? '報告問題…' : '報告問題…',
    click() {
      shell
        .openExternal('https://github.com/desktop/desktop/issues/new/choose')
        .catch(err => log.error('Failed opening issue creation page', err))
    },
  }

  const contactSupportItem: Electron.MenuItemConstructorOptions = {
    label: __DARWIN__ ? '聯絡 GitHub 支援…' : '聯絡 GitHub 支援(&C)…',
    click() {
      shell
        .openExternal(
          `https://github.com/contact?from_desktop_app=1&app_version=${app.getVersion()}`
        )
        .catch(err => log.error('Failed opening contact support page', err))
    },
  }

  const showUserGuides: Electron.MenuItemConstructorOptions = {
    label: '顯示使用者指南',
    click() {
      shell
        .openExternal('https://help.github.com/desktop/guides/')
        .catch(err => log.error('Failed opening user guides page', err))
    },
  }

  const showKeyboardShortcuts: Electron.MenuItemConstructorOptions = {
    label: __DARWIN__ ? '顯示鍵盤捷徑鍵' : '顯示鍵盤捷徑鍵',
    click() {
      shell
        .openExternal(
          'https://help.github.com/en/desktop/getting-started-with-github-desktop/keyboard-shortcuts-in-github-desktop'
        )
        .catch(err => log.error('Failed opening keyboard shortcuts page', err))
    },
  }

  const showLogsLabel = __DARWIN__
    ? 'Show Logs in Finder'
    : __WIN32__
    ? '顯示檔案管理器中的日誌(&H)'
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
          log.error('Failed opening logs directory', err)
        })
    },
  }

  const helpItems = [
    submitIssueItem,
    contactSupportItem,
    showUserGuides,
    showKeyboardShortcuts,
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
        label: '顯示彈出',
        submenu: [
          {
            label: '發行說明',
            click: emit('show-release-notes-popup'),
          },
        ],
      },
      {
        label: '修剪分支',
        click: emit('test-prune-branches'),
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

function getPushLabel(
  isForcePushForCurrentRepository: boolean,
  askForConfirmationOnForcePush: boolean
): string {
  if (!isForcePushForCurrentRepository) {
    return __DARWIN__ ? '推送' : '推送(&P)'
  }

  if (askForConfirmationOnForcePush) {
    return __DARWIN__ ? '強制推送…' : '強制推送(&P)…'
  }

  return __DARWIN__ ? '強制推送' : '強制推送(&P)'
}

function getStashedChangesLabel(isStashedChangesVisible: boolean): string {
  if (isStashedChangesVisible) {
    return __DARWIN__ ? '隱藏藏匿的變更' : '隱藏藏匿的變更(&I)'
  }

  return __DARWIN__ ? '顯示藏匿的變更' : '顯示藏匿的變更(&W)'
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
      const rawZoom = webContents.getZoomFactor()
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
      const newZoom = nextZoomLevel === undefined ? currentZoom : nextZoomLevel

      webContents.setZoomFactor(newZoom)
      webContents.send('zoom-factor-changed', newZoom)
    }
  }
}
