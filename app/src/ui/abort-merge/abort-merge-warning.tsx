import * as React from 'react'
import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Dispatcher } from '../../lib/dispatcher'
import { PopupType } from '../../models/popup'
import { Repository } from '../../models/repository'
import { Octicon, OcticonSymbol } from '../octicons'

interface IAbortMergeWarningProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly onDismissed: () => void
  readonly ourBranch: string
  readonly theirBranch?: string
}

const titleString = '確認中止合併'
const cancelButtonString = '取消'
const abortButtonString = '中止合併'

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
        title={titleString}
        dismissable={false}
        onDismissed={this.onCancel}
        onSubmit={this.onSubmit}
      >
        <DialogContent className="content-wrapper">
          <Octicon symbol={OcticonSymbol.alert} />
          {this.renderTextContent(this.props.ourBranch, this.props.theirBranch)}
        </DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type="submit">{abortButtonString}</Button>
            <Button onClick={this.onCancel}>{cancelButtonString}</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}
