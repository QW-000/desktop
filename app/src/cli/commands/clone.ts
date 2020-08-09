import * as QueryString from 'querystring'
import { URL } from 'url'

import { CommandError } from '../util'
import { openDesktop } from '../open-desktop'
import { ICommandModule, mriArgv } from '../load-commands'

interface ICloneArgs extends mriArgv {
  readonly branch?: string
}

export const command: ICommandModule = {
  command: 'clone <url|slug>',
  description: '克隆存儲庫',
  args: [
    {
      name: 'url|slug',
      required: true,
      description: '要克隆的網址或 GitHub 所有者/名稱別名',
      type: 'string',
    },
  ],
  options: {
    branch: {
      type: 'string',
      aliases: ['b'],
      description: '克隆後簽出的分支',
    },
  },
  handler({ _: [cloneUrl], branch }: ICloneArgs) {
    if (!cloneUrl) {
      throw new CommandError('必須指定克隆網址')
    }
    try {
      const _ = new URL(cloneUrl)
      _.toString() // don’t mark as unused
    } catch (e) {
      // invalid URL, assume a GitHub repo
      cloneUrl = `https://github.com/${cloneUrl}`
    }
    const url = `openRepo/${cloneUrl}?${QueryString.stringify({
      branch,
    })}`
    openDesktop(url)
  },
}
