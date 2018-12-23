const RestrictedFileExtensions = ['.cmd', '.exe', '.bat', '.sh']
export const CopyFilePathLabel = __DARWIN__
  ? 'Copy File Path'
  : '複製檔案路徑'

export const DefaultEditorLabel = __DARWIN__
  ? 'Open in External Editor'
  : '在外部編輯器中開啟'

export const RevealInFileManagerLabel = __DARWIN__
  ? '在 Finder 中顯示'
  : __WIN32__
  ? '在瀏覽器中顯示'
  : '在你的檔案管理器中顯示'

export const TrashNameLabel = __DARWIN__ ? 'Trash' : 'Recycle Bin'

export const OpenWithDefaultProgramLabel = __DARWIN__
  ? 'Open with Default Program'
  : '使用預設方案開啟'

export function isSafeFileExtension(extension: string): boolean {
  if (__WIN32__) {
    return RestrictedFileExtensions.indexOf(extension.toLowerCase()) === -1
  }
  return true
}
