import { spawn } from 'child_process'
import { pathExists } from 'fs-extra'
import { ExternalEditorError, FoundEditor } from './shared'

/**
 * Open a given file or folder in the desired external editor.
 *
 * @param fullPath A folder or file path to pass as an argument when launching the editor.
 * @param editor The external editor to launch.
 */
export async function launchExternalEditor(
  fullPath: string,
  editor: FoundEditor
): Promise<void> {
  const editorPath = editor.path
  const exists = await pathExists(editorPath)
  if (!exists) {
    const label = __DARWIN__ ? '喜好' : '選項'
    throw new ExternalEditorError(
      `無法在 '${editor.editor}' 路徑 '${editor.path}' 找到執行檔。  請開啟 ${label} 並選擇一個可用的編輯器。`,
      { openPreferences: true }
    )
  }
  if (editor.usesShell) {
    spawn(`"${editorPath}"`, [`"${fullPath}"`], { shell: true })
  } else {
    spawn(editorPath, [fullPath])
  }
}
