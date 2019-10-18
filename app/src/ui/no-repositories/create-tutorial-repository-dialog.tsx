import * as React from 'react'
import * as URL from 'url'
import * as Path from 'path'

import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Account } from '../../models/account'
import {
  getDotComAPIEndpoint,
  getHTMLURL,
  API,
  IAPIRepository,
} from '../../lib/api'
import { Ref } from '../lib/ref'
import { LinkButton } from '../lib/link-button'
import { getDefaultDir } from '../lib/default-dir'
import { writeFile, pathExists, ensureDir } from 'fs-extra'
import { git, GitError } from '../../lib/git'
import { envForAuthentication } from '../../lib/git/authentication'
import {
  PushProgressParser,
  executionOptionsWithProgress,
} from '../../lib/progress'
import { Progress } from '../../models/progress'
import { Dispatcher } from '../dispatcher'
import { APIError } from '../../lib/http'
import { sendNonFatalException } from '../../lib/helpers/non-fatal-exception'

interface ICreateTutorialRepositoryDialogProps {
  /**
   * The GitHub.com, or GitHub Enterprise Server account that will
   * be the owner of the tutorial repository.
   */
  readonly account: Account

  readonly dispatcher: Dispatcher

  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * Event triggered when the tutorial repository has been created
   * locally, initialized with the expected tutorial contents, and
   * pushed to the remote.
   *
   * @param path    The path on the local machine where the tutorial
   *                repository was created
   *
   * @param account The account (and thereby the GitHub host) under
   *                which the repository was created
   *
   * @param apiRepository The repository information as returned by
   *                      the GitHub API as the repository was created.
   */
  readonly onTutorialRepositoryCreated: (
    path: string,
    account: Account,
    apiRepository: IAPIRepository
  ) => Promise<void>

  /**
   * Event triggered when the component encounters an error while
   * attempting to create the tutorial repository. Consumers are
   * intended to display an error message to the end user in response
   * to this event.
   */
  readonly onError: (error: Error) => void
}

interface ICreateTutorialRepositoryDialogState {
  /**
   * Whether or not the dialog is currently in the process of creating
   * the tutorial repository. When true this will render a spinning
   * progress icon in the dialog header (if the dialog has a header) as
   * well as temporarily disable dismissal of the dialog.
   */
  readonly loading: boolean

  /**
   * The current progress in creating the tutorial repository. Undefined
   * until the creation process starts.
   */
  readonly progress?: Progress
}

const nl = __WIN32__ ? '\r\n' : '\n'
const InititalReadmeContents =
  `# 歡迎使用 GitHub Desktop!${nl}${nl}` +
  `這是你的讀我檔案。 README 檔案是您可以傳達的地方 ` +
  `您的項目是什麼以及如何使用。${nl}${nl}` +
  `在第 6 行上寫下您的名字並儲存，然後 ` +
  `返回到 GitHub Desktop。${nl}`

/**
 * A dialog component reponsible for initializing, publishing, and adding
 * a tutorial repository to the application.
 */
export class CreateTutorialRepositoryDialog extends React.Component<
  ICreateTutorialRepositoryDialogProps,
  ICreateTutorialRepositoryDialogState
> {
  public constructor(props: ICreateTutorialRepositoryDialogProps) {
    super(props)
    this.state = { loading: false }
  }

  private async createAPIRepository(account: Account, name: string) {
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

  private async pushRepo(
    path: string,
    account: Account,
    progressCb: (title: string, value: number, description?: string) => void
  ) {
    const pushTitle = `將存儲庫推送到 ${friendlyEndpointName(account)}`
    progressCb(pushTitle, 0)

    const pushOpts = await executionOptionsWithProgress(
      {
        env: envForAuthentication(account),
      },
      new PushProgressParser(),
      progress => {
        if (progress.kind === 'progress') {
          progressCb(pushTitle, progress.percent, progress.details.text)
        }
      }
    )

    const args = ['push', '-u', 'origin', 'master']
    await git(args, path, 'tutorial:push', pushOpts)
  }

  public onSubmit = async () => {
    this.props.dispatcher.recordTutorialStarted()

    const { account } = this.props
    const endpointName = friendlyEndpointName(account)
    this.setState({ loading: true })

    const name = 'desktop-tutorial'

    try {
      const path = Path.resolve(getDefaultDir(), name)

      if (await pathExists(path)) {
        throw new Error(
          `路徑 ${path} 已經存在。 請移動 ` +
            '或將其移除，然後重試。'
        )
      }

      this.setProgress(`在 ${endpointName} 建立存儲庫`, 0)

      const repo = await this.createAPIRepository(account, name)

      this.setProgress('初始化本機存儲庫', 0.2)

      await ensureDir(path)
      await git(['init'], path, 'tutorial:init')

      await writeFile(Path.join(path, 'README.md'), InititalReadmeContents)

      await git(['add', '--', 'README.md'], path, 'tutorial:add')
      await git(
        ['commit', '-m', 'Initial commit', '--', 'README.md'],
        path,
        'tutorial:commit'
      )
      await git(
        ['remote', 'add', 'origin', repo.clone_url],
        path,
        'tutorial:add-remote'
      )

      await this.pushRepo(path, account, (title, value, description) => {
        this.setProgress(title, 0.3 + value * 0.6, description)
      })

      this.setProgress('完成教學存儲庫', 0.9)
      await this.props.onTutorialRepositoryCreated(path, account, repo)
      this.props.dispatcher.recordTutorialRepoCreated()
      this.props.onDismissed()
    } catch (err) {
      this.setState({ loading: false, progress: undefined })

      sendNonFatalException('tutorialRepoCreation', err)

      if (err instanceof GitError) {
        this.props.onError(err)
      } else {
        this.props.onError(
          new Error(
            `建立教學存儲庫失敗。\n\n${err.message}`
          )
        )
      }
    }
  }

  private setProgress(title: string, value: number, description?: string) {
    this.setState({
      progress: { kind: 'generic', title, value, description },
    })
  }

  public onCancel = () => {
    this.props.onDismissed()
  }

  private renderProgress() {
    if (this.state.progress === undefined) {
      return null
    }

    const { progress } = this.state
    const description = progress.description ? (
      <div className="description">{progress.description}</div>
    ) : null

    return (
      <div className="progress-container">
        <div>{progress.title}</div>
        <progress value={progress.value} />
        {description}
      </div>
    )
  }

  public render() {
    const { account } = this.props

    return (
      <Dialog
        id="create-tutorial-repository-dialog"
        title="開始教學"
        onDismissed={this.onCancel}
        onSubmit={this.onSubmit}
        dismissable={!this.state.loading}
        loading={this.state.loading}
        disabled={this.state.loading}
      >
        <DialogContent>
          <div>
            這將在本機電腦上建立一個存儲庫，並將其推送到您在 <Ref>@{this.props.account.login}</Ref> {' '}
            <LinkButton uri={getHTMLURL(account.endpoint)}>
              {friendlyEndpointName(account)}
            </LinkButton>
            上的帳戶。 此存儲庫僅您可見，而不是公開顯示。
          </div>
          {this.renderProgress()}
        </DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type="submit">繼續</Button>
            <Button onClick={this.onCancel}>取消</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}

function friendlyEndpointName(account: Account) {
  return account.endpoint === getDotComAPIEndpoint()
    ? 'GitHub.com'
    : URL.parse(account.endpoint).hostname || account.endpoint
}
