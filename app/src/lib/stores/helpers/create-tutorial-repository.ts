import * as Path from 'path'

import { Account } from '../../../models/account'
import { writeFile, pathExists, ensureDir } from 'fs-extra'
import { API } from '../../api'
import { APIError } from '../../http'
import {
  executionOptionsWithProgress,
  PushProgressParser,
} from '../../progress'
import { git } from '../../git'
import { friendlyEndpointName } from '../../friendly-endpoint-name'
import { IRemote } from '../../../models/remote'
import { envForRemoteOperation } from '../../git/environment'

const nl = __WIN32__ ? '\r\n' : '\n'
const InititalReadmeContents =
  `# 歡迎使用 GitHub Desktop!${nl}${nl}` +
  `這是你的讀我檔案。 README 檔案是您可以傳達的地方 ` +
  `您的項目是什麼以及如何使用。${nl}${nl}` +
  `在第 6 行上寫下您的名字並儲存，然後 ` +
  `返回到 GitHub Desktop。${nl}`

async function createAPIRepository(account: Account, name: string) {
  const api = new API(account.endpoint, account.token)

  try {
    return await api.createRepository(
      null,
      name,
      'GitHub Desktop 教學存儲庫',
      true
    )
  } catch (err) {
    if (
      err instanceof APIError &&
      err.responseStatus === 422 &&
      err.apiError !== null
    ) {
      if (err.apiError.message === '存儲庫建立失敗。') {
        if (
          err.apiError.errors &&
          err.apiError.errors.some(
            x => x.message === '帳戶上已存在此名稱'
          )
        ) {
          throw new Error(
            '在 ' +
                `"${name}" 帳戶上已經有一個名為 ${friendlyEndpointName(
                  account
                )}的存儲庫。\n\n` +
                '請刪除存儲庫，然後重試。'
          )
        }
      }
    }

    throw err
  }
}

async function pushRepo(
  path: string,
  account: Account,
  remote: IRemote,
  progressCb: (title: string, value: number, description?: string) => void
) {
  const pushTitle = `將存儲庫推送到 ${friendlyEndpointName(account)}`
  progressCb(pushTitle, 0)

  const pushOpts = await executionOptionsWithProgress(
    {
      env: await envForRemoteOperation(account, remote.url),
    },
    new PushProgressParser(),
    progress => {
      if (progress.kind === 'progress') {
        progressCb(pushTitle, progress.percent, progress.details.text)
      }
    }
  )

  const args = ['push', '-u', remote.name, 'master']
  await git(args, path, 'tutorial:push', pushOpts)
}

/**
 * Creates a repository on the remote (as specified by the Account
 * parameter), initializes an empty repository at the given path,
 * sets up the expected tutorial contents, and pushes the repository
 * to the remote.
 *
 * @param path    The path on the local machine where the tutorial
 *                repository is to be created
 *
 * @param account The account (and thereby the GitHub host) under
 *                which the repository is to be created created
 */
export async function createTutorialRepository(
  account: Account,
  name: string,
  path: string,
  progressCb: (title: string, value: number, description?: string) => void
) {
  const endpointName = friendlyEndpointName(account)
  progressCb(`在 ${endpointName} 建立存儲庫`, 0)

  if (await pathExists(path)) {
    throw new Error(
      `路徑 '${path}' 已經存在。 請移動 ` +
            '或將其移除，然後重試。'
    )
  }

  const repo = await createAPIRepository(account, name)

  progressCb('初始化本機存儲庫', 0.2)

  await ensureDir(path)
  await git(['init'], path, 'tutorial:init')

  await writeFile(Path.join(path, 'README.md'), InititalReadmeContents)

  await git(['add', '--', 'README.md'], path, 'tutorial:add')
  await git(
    ['commit', '-m', 'Initial commit', '--', 'README.md'],
    path,
    'tutorial:commit'
  )

  const remote: IRemote = { name: 'origin', url: repo.clone_url }

  await git(
    ['remote', 'add', remote.name, remote.url],
    path,
    'tutorial:add-remote'
  )

  await pushRepo(path, account, remote, (title, value, description) => {
    progressCb(title, 0.3 + value * 0.6, description)
  })

  progressCb('完成教學存儲庫', 0.9)

  return repo
}
