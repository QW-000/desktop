import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Dispatcher } from '../dispatcher'
import { PopupType } from '../../models/popup'
import { Repository } from '../../models/repository'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IAbortMergeWarningProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly onDismissed: () => void
  readonly ourBranch: string
  readonly theirBranch?: string
}

/**
 * Modal to tell the user their merge encountered conflicts
 */
export class AbortMergeWarning extends React.Component<
  IAbortMergeWarningProps,
  {}
> {
  /**
   *  Aborts the merge and dismisses the modal
   */
  private onSubmit = async () => {
    await this.props.dispatcher.abortMerge(this.props.repository)
    this.props.onDismissed()
  }

  /**
   *  dismisses the modal and shows the merge conflicts modal
   */
  private onCancel = () => {
    this.props.onDismissed()
    this.props.dispatcher.showPopup({
      type: PopupType.MergeConflicts,
      repository: this.props.repository,
      ourBranch: this.props.ourBranch,
      theirBranch: this.props.theirBranch,
    })
  }

  private renderTextContent(ourBranch: string, theirBranch?: string) {
    let firstParagraph

    if (theirBranch !== undefined) {
      firstParagraph = (
        <p>
          {'你確定要中止合併 '}
          <strong>{theirBranch}</strong>
          {' 為 '}
          <strong>{ourBranch}</strong>?
        </p>
      )
    } else {
      firstParagraph = (
        <p>
          {'你確定要中止合併為 '}
          <strong>{ourBranch}</strong>?
        </p>
      )
    }

    return (
      <div className="column-left">
        {firstParagraph}
        <p>
          中止此合併將回到合併前狀態，並且您已解決的衝突仍將存在。
        </p>
      </div>
    )
  }

  public render() {
    return (
      <Dialog
        id="abort-merge-warning"
        title={__DARWIN__ ? '確認中止合併' : '確認中止合併'}
        onDismissed={this.onCancel}
        onSubmit={this.onSubmit}
        type="warning"
      >
        <DialogContent>
          {this.renderTextContent(this.props.ourBranch, this.props.theirBranch)}
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText={__DARWIN__ ? '中止合併' : '中止合併'}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
