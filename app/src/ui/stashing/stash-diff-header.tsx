import * as React from 'react'
import { IStashEntry } from '../../models/stash-entry'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { PopupType } from '../../models/popup'
import { Octicon, OcticonSymbol } from '../octicons'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IStashDiffHeaderProps {
  readonly stashEntry: IStashEntry
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly isWorkingTreeClean: boolean
}

interface IStashDiffHeaderState {
  readonly isRestoring: boolean
}

/**
 * Component to provide the actions that can be performed
 * on a stash while viewing a stash diff
 */
export class StashDiffHeader extends React.Component<
  IStashDiffHeaderProps,
  IStashDiffHeaderState
> {
  public constructor(props: IStashDiffHeaderProps) {
    super(props)

    this.state = {
      isRestoring: false,
    }
  }

  public render() {
    const { isWorkingTreeClean } = this.props
    const { isRestoring } = this.state

    return (
      <div className="header">
        <h3>藏匿變更</h3>
        <div className="row">
          <OkCancelButtonGroup
            okButtonText="復原"
            okButtonDisabled={isRestoring || !isWorkingTreeClean}
            onOkButtonClick={this.onRestoreClick}
            cancelButtonText="丟棄"
            cancelButtonDisabled={isRestoring}
            onCancelButtonClick={this.onDiscardClick}
          />
          {this.renderExplanatoryText()}
        </div>
      </div>
    )
  }

  private renderExplanatoryText() {
    const { isWorkingTreeClean } = this.props

    if (isWorkingTreeClean || this.state.isRestoring) {
      return (
        <div className="explanatory-text">
          <span className="text">
            <strong>復原</strong> 將您的藏匿檔案移動到變更清單。
          </span>
        </div>
      )
    }

    return (
      <div className="explanatory-text">
        <Octicon symbol={OcticonSymbol.alert} />
        <span className="text">
          當分支上存在變更時無法復原藏匿。
        </span>
      </div>
    )
  }

  private onDiscardClick = () => {
    const { dispatcher, repository, stashEntry } = this.props
    dispatcher.showPopup({
      type: PopupType.ConfirmDiscardStash,
      stash: stashEntry,
      repository,
    })
  }

  private onRestoreClick = async () => {
    const { dispatcher, repository, stashEntry } = this.props

    this.setState({ isRestoring: true }, () => {
      dispatcher.popStash(repository, stashEntry)
    })
  }
}
