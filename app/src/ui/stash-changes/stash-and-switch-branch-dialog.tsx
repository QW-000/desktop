import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { VerticalSegmentedControl } from '../lib/vertical-segmented-control'
import { Row } from '../lib/row'
import { Branch } from '../../models/branch'
import { ButtonGroup } from '../lib/button-group'
import { Button } from '../lib/button'
import { UncommittedChangesStrategy } from '../../models/uncommitted-changes-strategy'
import { Octicon, OcticonSymbol } from '../octicons'
import { PopupType } from '../../models/popup'

enum StashAction {
  StashOnCurrentBranch,
  MoveToNewBranch,
}
interface ISwitchBranchProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly currentBranch: Branch

  /** The branch to checkout after the user selects a stash action */
  readonly branchToCheckout: Branch

  /** Whether `currentBranch` has an existing stash association */
  readonly hasAssociatedStash: boolean
  readonly onDismissed: () => void
}

interface ISwitchBranchState {
  readonly isStashingChanges: boolean
  readonly selectedStashAction: StashAction
}

/**
 * Dialog that alerts users that their changes may be lost and offers them the
 * chance to stash them or potentially take them to another branch
 */
export class StashAndSwitchBranch extends React.Component<
  ISwitchBranchProps,
  ISwitchBranchState
> {
  public constructor(props: ISwitchBranchProps) {
    super(props)

    this.state = {
      isStashingChanges: false,
      selectedStashAction: StashAction.StashOnCurrentBranch,
    }
  }

  public render() {
    const { isStashingChanges } = this.state
    return (
      <Dialog
        id="stash-changes"
        title={__DARWIN__ ? '切換分支' : '切換分支'}
        onSubmit={this.onSubmit}
        onDismissed={this.props.onDismissed}
        loading={isStashingChanges}
        disabled={isStashingChanges}
      >
        <DialogContent>
          {this.renderStashActions()}
          {this.renderStashOverwriteWarning()}
        </DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type="submit">
              {__DARWIN__ ? '切換分支' : '切換分支'}
            </Button>
            <Button onClick={this.props.onDismissed}>取消</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }

  private renderStashOverwriteWarning() {
    if (
      !this.props.hasAssociatedStash ||
      this.state.selectedStashAction !== StashAction.StashOnCurrentBranch
    ) {
      return null
    }

    return (
      <Row>
        <Octicon symbol={OcticonSymbol.alert} /> 您當前的隱匿將被建立一個新的隱匿覆蓋
      </Row>
    )
  }

  private renderStashActions() {
    const { branchToCheckout } = this.props
    const items = [
      {
        title: `保留我的變更 ${this.props.currentBranch.name}`,
        description:
          '您正在進行的工作將被隱匿在此分支上，以便您之後復原',
      },
      {
        title: `將我的變更於 ${branchToCheckout.name}`,
        description: '你正在進行的工作將跟蹤到新的分支',
      },
    ]

    return (
      <Row>
        <VerticalSegmentedControl
          label="您對此分支進行了變更。 你想怎麼做呢?"
          items={items}
          selectedIndex={this.state.selectedStashAction}
          onSelectionChanged={this.onSelectionChanged}
        />
      </Row>
    )
  }

  private onSelectionChanged = (action: StashAction) => {
    this.setState({ selectedStashAction: action })
  }

  private onSubmit = async () => {
    const {
      repository,
      dispatcher,
      hasAssociatedStash,
      branchToCheckout,
    } = this.props

    if (
      this.state.selectedStashAction === StashAction.StashOnCurrentBranch &&
      hasAssociatedStash
    ) {
      dispatcher.showPopup({
        type: PopupType.ConfirmOverwriteStash,
        repository,
        branchToCheckout,
      })
      return
    }

    this.setState({ isStashingChanges: true })

    try {
      await this.stashAndCheckout()
    } finally {
      this.setState({ isStashingChanges: false })
    }

    this.props.onDismissed()
  }

  private async stashAndCheckout() {
    const { repository, branchToCheckout, dispatcher } = this.props
    const { selectedStashAction } = this.state

    if (selectedStashAction === StashAction.StashOnCurrentBranch) {
      await dispatcher.checkoutBranch(
        repository,
        branchToCheckout,
        UncommittedChangesStrategy.stashOnCurrentBranch
      )
    } else if (selectedStashAction === StashAction.MoveToNewBranch) {
      await dispatcher.checkoutBranch(
        repository,
        branchToCheckout,
        UncommittedChangesStrategy.moveToNewBranch
      )
    }
  }
}
