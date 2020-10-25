import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { LinkButton } from '../lib/link-button'
import { getGlobalConfigPath } from '../../lib/git'
import { shell } from '../../lib/app-shell'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IAttributeMismatchProps {
  /** Called when the dialog should be dismissed. */
  readonly onDismissed: () => void

  /** Called when the user has chosen to replace the update filters. */
  readonly onUpdateExistingFilters: () => void
}

interface IAttributeMismatchState {
  readonly globalGitConfigPath: string | null
}

export class AttributeMismatch extends React.Component<
  IAttributeMismatchProps,
  IAttributeMismatchState
> {
  public constructor(props: IAttributeMismatchProps) {
    super(props)

    this.state = {
      globalGitConfigPath: null,
    }
  }

  public async componentDidMount() {
    try {
      const path = await getGlobalConfigPath()
      this.setState({ globalGitConfigPath: path })
    } catch (error) {
      log.warn(`Couldn't get the global git config path`, error)
    }
  }

  private renderGlobalGitConfigLink() {
    const path = this.state.globalGitConfigPath
    const msg = '你的 git 全局設定'
    if (path) {
      return <LinkButton onClick={this.showGlobalGitConfig}>{msg}</LinkButton>
    } else {
      return msg
    }
  }

  private showGlobalGitConfig = () => {
    const path = this.state.globalGitConfigPath
    if (path) {
      shell.openPath(path)
    }
  }

  public render() {
    return (
      <Dialog
        id="lfs-attribute-mismatch"
        title={
          __DARWIN__
            ? 'Update Existing Git LFS Filters?'
            : '更新現存的 Git LFS 過濾器?'
        }
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <p>
            Git 過濾器已在{' '}
            {this.renderGlobalGitConfigLink()} 中設置，但不是預期的值。 你想現在更新嗎?
          </p>
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={
              __DARWIN__ ? 'Update Existing Filters' : '更新現存過濾器'
            }
            cancelButtonText={__DARWIN__ ? 'Not Now' : '現在不要'}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onSubmit = () => {
    this.props.onUpdateExistingFilters()
    this.props.onDismissed()
  }
}
