import * as React from 'react'
import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { InstalledCLIPath } from '../lib/install-cli'

interface ICLIInstalledProps {
  /** Called when the popup should be dismissed. */
  readonly onDismissed: () => void
}

/** Tell the user the CLI tool was successfully installed. */
export class CLIInstalled extends React.Component<ICLIInstalledProps, {}> {
  public render() {
    return (
      <Dialog
        title={
          __DARWIN__
            ? 'Command Line Tool Installed'
            : '已安裝命令行工具'
        }
        onDismissed={this.props.onDismissed}
        onSubmit={this.props.onDismissed}
      >
        <DialogContent>
          <div>
            命令行工具已安裝在{' '}
            <strong>{InstalledCLIPath}</strong>.
          </div>
        </DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type="submit">確定</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}
