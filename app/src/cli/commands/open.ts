import chalk from 'chalk'
import * as Path from 'path'

import { ICommandModule, mriArgv } from '../load-commands'
import { openDesktop } from '../open-desktop'
import { parseRemote } from '../../lib/remote-parsing'

export const command: ICommandModule = {
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
    //Check if the pathArg is a remote url
    if (parseRemote(pathArg) != null) {
      console.log(
        `\nYou cannot open a remote URL in GitHub Desktop\n` +
          `Use \`${chalk.bold(`git clone ` + pathArg)}\`` +
          ` instead to initiate the clone`
      )
    } else {
      const repositoryPath = Path.resolve(process.cwd(), pathArg)
      const url = `openLocalRepo/${encodeURIComponent(repositoryPath)}`
      openDesktop(url)
    }
  },
}
