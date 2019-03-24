import * as React from 'react'
import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Monospaced } from '../lib/monospaced'
import { PathText } from '../lib/path-text'
import { Dispatcher } from '../../ui/dispatcher'
import { Repository } from '../../models/repository'
import { RetryAction } from '../../models/retry-actions'
import { WorkingDirectoryStatus } from '../../models/status'

interface ILocalChangesOverwrittenWarningProps {
  readonly overwrittenFiles: ReadonlyArray<string>
  readonly onDismissed: () => void
  readonly dispatcher: Dispatcher
  readonly retryAction: RetryAction
  readonly repository: Repository
  readonly workingDirectory: WorkingDirectoryStatus
}

/** A dialog to display a list of files that would be overwritten by a checkout. */
export class LocalChangesOverwrittenWarning extends React.Component<
  ILocalChangesOverwrittenWarningProps
> {
  private closeButton: Button | null = null

  public constructor(props: ILocalChangesOverwrittenWarningProps) {
    super(props)
  }

  private onCloseButtonRef = (button: Button | null) => {
    this.closeButton = button
  }

  public componentDidMount() {
    // Since focus is given to the overwritten files by default, we will instead set focus onto the cancel button.
    if (this.closeButton != null) {
      this.closeButton.focus()
    }
  }

  public render() {
    return (
      <Dialog
        id="overwritten-files"
        title={__DARWIN__ ? '檔案覆蓋' : '檔案覆蓋'}
        onDismissed={this.props.onDismissed}
        type="warning"
      >
        <DialogContent>
          <p>
            簽出分支時，將覆蓋以下檔案。
          </p>
          {this.renderFileList()}
          <p className="recommendation">
            我們建議您手動提交這些檔案或將其丟棄。
          </p>
        </DialogContent>

        <DialogFooter>
          <ButtonGroup destructive={true}>
            <Button type="submit" ref={this.onCloseButtonRef}>
              取消
            </Button>
            <Button onClick={this.discardChangesAndRetry}>
              {__DARWIN__
                ? '放棄變更與簽出'
                : '放棄變更與簽出'}
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }

  private renderFileList() {
    return (
      <div className="files-list">
        {this.props.overwrittenFiles.map(fileName => (
          <ul key={fileName}>
            <Monospaced>
              <PathText path={fileName} />
            </Monospaced>
          </ul>
        ))}
      </div>
    )
  }

  private discardChangesAndRetry = async () => {
    this.props.dispatcher.closePopup()

    const { overwrittenFiles } = this.props

    await this.props.dispatcher.discardChanges(
      this.props.repository,
      this.props.workingDirectory.files.filter(
        f => overwrittenFiles.indexOf(f.path) !== -1
      )
    )

    this.props.dispatcher.performRetry(this.props.retryAction)
  }
}
