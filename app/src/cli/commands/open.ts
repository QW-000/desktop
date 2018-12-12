import * as Path from 'path'

import { ICommandModule, mriArgv } from '../load-commands'
import { openDesktop } from '../open-desktop'

const command: ICommandModule = {
  command: 'open <path>',
  aliases: ['<path>'],
  description: '�b GitHub Desktop ���}�Ҥ@�� git �s�x�w',
  args: [
    {
      name: 'path',
      description: '�n�}�Ҫ��s�x�w���|',
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
