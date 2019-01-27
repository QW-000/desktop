import * as React from 'react'

import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { shell } from '../../lib/app-shell'

interface IInstallGitProps {
  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * The path to the current repository, in case the user wants to continue
   * doing whatever they're doing.
   */
  readonly path: string

  /** Called when the user chooses to open the shell. */
  readonly onOpenShell: (path: string) => void
}

/**
 * A dialog indicating that Git wasn't found, to direct the user to an
 * external resource for more information about setting up their environment.
 */
export class InstallGit extends React.Component<IInstallGitProps, {}> {
  public constructor(props: IInstallGitProps) {
    super(props)
  }

  private onContinue = () => {
    this.props.onOpenShell(this.props.path)
  }

  private onExternalLink = () => {
    const url = `https://help.github.com/articles/set-up-git/#setting-up-git`
    shell.openExternal(url)
  }

  public render() {
    return (
      <Dialog
        id="install-git"
        type="warning"
        title={__DARWIN__ ? 'Unable to Locate Git' : '無法找到 Git'}
        onSubmit={this.props.onDismissed}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <p>
            無法在您的系統上找到 Git 這意味著您將無法執行任何 Git 命令{' '}
            {__DARWIN__ ? '終端視窗' : '命令提示字元'}。
          </p>
          <p>
            為了協助您為作業系統安裝和設置 Git 我們提供了一些外部資源。
          </p>
        </DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type="submit" onClick={this.onContinue}>
              沒有開啟 Git
            </Button>
            <Button onClick={this.onExternalLink}>安裝 Git</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}
