import * as React from 'react'

import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { ConfirmAbortStep } from '../../models/rebase-flow-step'
import { Ref } from '../lib/ref'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IConfirmAbortDialogProps {
  readonly step: ConfirmAbortStep

  readonly onReturnToConflicts: (step: ConfirmAbortStep) => void
  readonly onConfirmAbort: () => Promise<void>
}

interface IConfirmAbortDialogState {
  readonly isAborting: boolean
}

export class ConfirmAbortDialog extends React.Component<
  IConfirmAbortDialogProps,
  IConfirmAbortDialogState
> {
  public constructor(props: IConfirmAbortDialogProps) {
    super(props)
    this.state = {
      isAborting: false,
    }
  }

  private onSubmit = async () => {
    this.setState({
      isAborting: true,
    })

    await this.props.onConfirmAbort()

    this.setState({
      isAborting: false,
    })
  }

  /**
   *  Dismisses the modal and shows the rebase conflicts modal
   */
  private onCancel = async () => {
    await this.props.onReturnToConflicts(this.props.step)
  }

  private renderTextContent(targetBranch: string, baseBranch?: string) {
    let firstParagraph

    if (baseBranch !== undefined) {
      firstParagraph = (
        <p>
          {'您確定要中止變基 '}
          <Ref>{baseBranch}</Ref>
          {' 到 '}
          <Ref>{targetBranch}</Ref>?
        </p>
      )
    } else {
      firstParagraph = (
        <p>
          {'您確定要中止變基 '}
          <Ref>{targetBranch}</Ref>?
        </p>
      )
    }

    return (
      <div className="column-left">
        {firstParagraph}
        <p>
          中止此變基將使您回到原始分支狀態，並且您已經解決的衝突將被丟棄。
        </p>
      </div>
    )
  }

  public render() {
    const { targetBranch, baseBranch } = this.props.step.conflictState

    return (
      <Dialog
        id="abort-merge-warning"
        title={__DARWIN__ ? 'Confirm Abort Rebase' : '確認中止變基'}
        onDismissed={this.onCancel}
        onSubmit={this.onSubmit}
        disabled={this.state.isAborting}
        type="warning"
      >
        <DialogContent>
          {this.renderTextContent(targetBranch, baseBranch)}
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText={__DARWIN__ ? 'Abort Rebase' : '中止變基'}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
