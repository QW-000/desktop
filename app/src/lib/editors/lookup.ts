import { ExternalEditor, ExternalEditorError } from './shared'
import { IFoundEditor } from './found-editor'
import { getAvailableEditors as getAvailableEditorsDarwin } from './darwin'
import { getAvailableEditors as getAvailableEditorsWindows } from './win32'
import { getAvailableEditors as getAvailableEditorsLinux } from './linux'

let editorCache: ReadonlyArray<IFoundEditor<ExternalEditor>> | null = null

/**
 * Resolve a list of installed editors on the user's machine, using the known
 * install identifiers that each OS supports.
 */
export async function getAvailableEditors(): Promise<
  ReadonlyArray<IFoundEditor<ExternalEditor>>
> {
  if (editorCache && editorCache.length > 0) {
    return editorCache
  }

  if (__DARWIN__) {
    editorCache = await getAvailableEditorsDarwin()
    return editorCache
  }

  if (__WIN32__) {
    editorCache = await getAvailableEditorsWindows()
    return editorCache
  }

  if (__LINUX__) {
    editorCache = await getAvailableEditorsLinux()
    return editorCache
  }

  log.warn(
    `Platform not currently supported for resolving editors: ${process.platform}`
  )

  return []
}

/**
 * Find an editor installed on the machine using the friendly name, or the
 * first valid editor if `null` is provided.
 *
 * Will throw an error if no editors are found, or if the editor name cannot
 * be found (i.e. it has been removed).
 */
export async function findEditorOrDefault(
  name: string | null
): Promise<IFoundEditor<ExternalEditor> | null> {
  const editors = await getAvailableEditors()
  if (editors.length === 0) {
    return null
  }

  if (name) {
    const match = editors.find(p => p.editor === name) || null
    if (!match) {
      const menuItemName = __DARWIN__ ? '喜好' : '選項'
      const message = `無法找到 '${name}' 編輯器。 請開啟 ${menuItemName} 並選擇一個可用的編輯器。`

      throw new ExternalEditorError(message, { openPreferences: true })
    }

    return match
  }

  return editors[0]
}
