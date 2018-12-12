import * as Path from 'path'

import { ICommandModule, mriArgv } from '../load-commands'
import { openDesktop } from '../open-desktop'

const command: ICommandModule = {
  command: 'open <path>',
  aliases: ['<path>'],
  description: '在 GitHub Desktop 中開啟一個 git 存儲庫',
  args: [
    {
      name: 'path',
      description: '要開啟的存儲庫路徑',
      type: 'string',
      required: false,
    },
  ],
  handler({ _: [pathArg] }: mriArgv) {
    if (!pathArg) {
      // just open Desktop
      openDesktop()
      return
    }
    const repositoryPath = Path.resolve(process.cwd(), pathArg)
    const url = `openLocalRepo/${encodeURIComponent(repositoryPath)}`
    openDesktop(url)
  },
}
export = command
