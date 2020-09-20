export function parseFilesToBeOverwritten(errorMessage: string) {
  const files = new Array<string>()
  const lines = errorMessage.split('\n')

  let inFilesList = false

  for (const line of lines) {
    if (inFilesList) {
      if (!line.startsWith('\t')) {
        break
      } else {
        files.push(line.trimLeft())
      }
    } else {
      if (
        line.startsWith('錯誤:') &&
        line.includes('檔案將被取代') &&
        line.endsWith(':')
      ) {
        inFilesList = true
      }
    }
  }

  return files
}
