import * as React from 'react'

import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { WorkingDirectoryFileChange } from '../../models/status'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { PathText } from '../lib/path-text'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { TrashNameLabel } from '../lib/context-menu'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IDiscardChangesProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly files: ReadonlyArray<WorkingDirectoryFileChange>
  readonly confirmDiscardChanges: boolean
  /**
   * Determines whether to show the option
   * to ask for confirmation when discarding
   * changes
   */
  readonly discardingAllChanges: boolean
  readonly showDiscardChangesSetting: boolean
  readonly onDismissed: () => void
  readonly onConfirmDiscardChangesChanged: (optOut: boolean) => void
}

interface IDiscardChangesState {
  /**
   * Whether or not we're currently in the process of discarding
   * changes. This is used to display a loading state
   */
  readonly isDiscardingChanges: boolean

  readonly confirmDiscardChanges: boolean
}

/**
 * If we're discarding any more than this number, we won't bother listing them
 * all.
 */
const MaxFilesToList = 10

/** A component to confirm and then discard changes. */
export class DiscardChanges extends React.Component<
  IDiscardChangesProps,
  IDiscardChangesState
> {
  public constructor(props: IDiscardChangesProps) {
    super(props)

    this.state = {
      isDiscardingChanges: false,
      confirmDiscardChanges: this.props.confirmDiscardChanges,
    }
  }

  private getOkButtonLabel() {
    if (this.props.discardingAllChanges) {
      return __DARWIN__ ? 'Discard All Changes' : '放棄全部變更'
    }
    return __DARWIN__ ? 'Discard Changes' : '放棄變更'
  }

  private getDialogTitle() {
    if (this.props.discardingAllChanges) {
      return __DARWIN__
        ? 'Confirm Discard All Changes'
        : '確認放棄全部變更'
    }
    return __DARWIN__ ? 'Confirm Discard Changes' : '確認放棄變更'
  }

  public render() {
    const isDiscardingChanges = this.state.isDiscardingChanges

    return (
      <Dialog
        id="discard-changes"
        title={this.getDialogTitle()}
        onDismissed={this.props.onDismissed}
        onSubmit={this.discard}
        dismissable={isDiscardingChanges ? false : true}
        loading={isDiscardingChanges}
        disabled={isDiscardingChanges}
        type="warning"
      >
        <DialogContent>
          {this.renderFileList()}
          <p>
            可以從 {TrashNameLabel} 檢索變更其恢復
          </p>
          {this.renderConfirmDiscardChanges()}
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText={this.getOkButtonLabel()}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private renderConfirmDiscardChanges() {
    if (this.props.showDiscardChangesSetting) {
      return (
        <Checkbox
          label="不要再顯示此訊息"
          value={
            this.state.confirmDiscardChanges
              ? CheckboxValue.Off
              : CheckboxValue.On
          }
          onChange={this.onConfirmDiscardChangesChanged}
        />
      )
    } else {
      // since we ignore the users option to not show
      // confirmation, we don't want to show a checkbox
      // that will have no effect
      return null
    }
  }

  private renderFileList() {
    if (this.props.files.length > MaxFilesToList) {
      return (
        <p>
          您確定要丟棄全部 {this.props.files.length} 已變更的檔案嗎?
        </p>
      )
    } else {
      return (
        <div>
          <p>您確定要放棄全部變更:</p>
          <ul>
            {this.props.files.map(p => (
              <li key={p.id}>
                <PathText path={p.path} />
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }

  private discard = async () => {
    this.setState({ isDiscardingChanges: true })

    await this.props.dispatcher.discardChanges(
      this.props.repository,
      this.props.files
    )

    this.props.onConfirmDiscardChangesChanged(this.state.confirmDiscardChanges)
    this.props.onDismissed()
  }

  private onConfirmDiscardChangesChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = !event.currentTarget.checked

    this.setState({ confirmDiscardChanges: value })
  }
}
