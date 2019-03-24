import { shell } from '../../lib/app-shell'
import { Dispatcher } from '../dispatcher'

export async function openFile(
  fullPath: string,
  dispatcher: Dispatcher
): Promise<void> {
  const result = await shell.openExternal(`file://${fullPath}`)

  if (!result) {
    const error = {
      name: 'no-external-program',
      message: `無法在外部程式中開啟檔案 ${fullPath} 。 請檢查是否有與此檔案副檔名相關的程式`,
    }
    await dispatcher.postError(error)
  }
}
