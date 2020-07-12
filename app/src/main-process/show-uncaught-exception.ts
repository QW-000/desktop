import { app, dialog } from 'electron'
import { setCrashMenu } from './menu'
import { formatError } from '../lib/logging/format-error'
import { CrashWindow } from './crash-window'

let hasReportedUncaughtException = false

/** Show the uncaught exception UI. */
export function showUncaughtException(isLaunchError: boolean, error: Error) {
  log.error(formatError(error))

  if (hasReportedUncaughtException) {
    return
  }

  hasReportedUncaughtException = true

  setCrashMenu()

  const crashWindow = new CrashWindow(
    isLaunchError ? 'launch' : 'generic',
    error
  )

  crashWindow.onDidLoad(() => {
    crashWindow.show()
  })

  crashWindow.onFailedToLoad(async () => {
    await dialog.showMessageBox({
      type: 'error',
      title: __DARWIN__ ? `Unrecoverable Error` : '無法復原之錯誤',
      message:
        `GitHub Desktop 遇到無法復原之錯誤，需要重新啟動。\n\n` +
        `這已被報告給團隊，但如果您屢次遇到此錯誤請報告 ` +
        `這個問題到此 GitHub Desktop 的問題跟踪。\n\n${
          error.stack || error.message
        }`,
    })

    if (!__DEV__) {
      app.relaunch()
    }
    app.quit()
  })

  crashWindow.onClose(() => {
    if (!__DEV__) {
      app.relaunch()
    }
    app.quit()
  })

  crashWindow.load()
}
