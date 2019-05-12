import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import { OcticonSymbol } from '../octicons'
import { Repository } from '../../models/repository'
import { TipState } from '../../models/tip'
import { ToolbarDropdown, DropdownState } from './dropdown'
import { IRepositoryState, isRebaseConflictState } from '../../lib/app-state'
import { BranchesContainer, PullRequestBadge } from '../branches'
import { assertNever } from '../../lib/fatal-error'
import { BranchesTab } from '../../models/branches-tab'
import { PullRequest } from '../../models/pull-request'
import { enablePullWithRebase } from '../../lib/feature-flag'

interface IBranchDropdownProps {
  readonly dispatcher: Dispatcher

  /** The currently selected repository. */
  readonly repository: Repository

  /** The current repository state as derived from AppState */
  readonly repositoryState: IRepositoryState

  /** Whether or not the branch dropdown is currently open */
  readonly isOpen: boolean

  /**
   * An event handler for when the drop down is opened, or closed, by a pointer
   * event or by pressing the space or enter key while focused.
   *
   * @param state    - The new state of the drop down
   */
  readonly onDropDownStateChanged: (state: DropdownState) => void

  /** The currently selected tab. */
  readonly selectedTab: BranchesTab

  /** The open pull requests in the repository. */
  readonly pullRequests: ReadonlyArray<PullRequest>

  /** The pull request associated with the current branch. */
  readonly currentPullRequest: PullRequest | null

  /** Are we currently loading pull requests? */
  readonly isLoadingPullRequests: boolean
}

/**
 * A drop down for selecting the currently checked out branch.
 */
export class BranchDropdown extends React.Component<IBranchDropdownProps> {
  private renderBranchFoldout = (): JSX.Element | null => {
    const repositoryState = this.props.repositoryState
    const branchesState = repositoryState.branchesState

    const tip = repositoryState.branchesState.tip
    const currentBranch = tip.kind === TipState.Valid ? tip.branch : null

    return (
      <BranchesContainer
        allBranches={branchesState.allBranches}
        recentBranches={branchesState.recentBranches}
        currentBranch={currentBranch}
        defaultBranch={branchesState.defaultBranch}
        dispatcher={this.props.dispatcher}
        repository={this.props.repository}
        selectedTab={this.props.selectedTab}
        pullRequests={this.props.pullRequests}
        currentPullRequest={this.props.currentPullRequest}
        isLoadingPullRequests={this.props.isLoadingPullRequests}
      />
    )
  }

  private onDropDownStateChanged = (state: DropdownState) => {
    // Don't allow opening the drop down when checkout is in progress
    if (state === 'open' && this.props.repositoryState.checkoutProgress) {
      return
    }

    this.props.onDropDownStateChanged(state)
  }

  public render() {
    const { repositoryState } = this.props
    const { branchesState, checkoutProgress, changesState } = repositoryState
    const { tip } = branchesState
    const { conflictState } = changesState

    const tipKind = tip.kind

    let icon = OcticonSymbol.gitBranch
    let iconClassName: string | undefined = undefined
    let title: string
    let description = __DARWIN__ ? 'Current Branch' : '當前分支'
    let canOpen = true
    let disabled = false
    let tooltip: string

    if (this.props.currentPullRequest) {
      icon = OcticonSymbol.gitPullRequest
    }

    if (tip.kind === TipState.Unknown) {
      // TODO: this is bad and I feel bad
      return null
    } else if (tip.kind === TipState.Unborn) {
      title = tip.ref
      tooltip = `現在的分支是 ${tip.ref}`
      canOpen = branchesState.allBranches.length > 0
    } else if (tip.kind === TipState.Detached) {
      title = `On ${tip.currentSha.substr(0, 7)}`
      tooltip = '當前在分離的 HEAD'
      icon = OcticonSymbol.gitCommit
      description = 'Detached HEAD'
    } else if (tip.kind === TipState.Valid) {
      title = tip.branch.name
      tooltip = `現在的分支是 ${title}`
    } else {
      return assertNever(tip, `未知的提示狀態: ${tipKind}`)
    }

    let progressValue: number | undefined = undefined

    if (checkoutProgress) {
      title = checkoutProgress.targetBranch
      description = __DARWIN__ ? 'Switching to Branch' : '切換到分支'

      if (checkoutProgress.value > 0) {
        const friendlyProgress = Math.round(checkoutProgress.value * 100)
        description = `${description} (${friendlyProgress} %)`
      }

      progressValue = checkoutProgress.value
      icon = OcticonSymbol.sync
      iconClassName = 'spin'
      canOpen = false
    } else if (
      conflictState !== null &&
      isRebaseConflictState(conflictState) &&
      enablePullWithRebase()
    ) {
      title = conflictState.targetBranch
      description = '變基分支'
      icon = OcticonSymbol.gitBranch
      canOpen = false
      disabled = true
    }

    const isOpen = this.props.isOpen
    const currentState: DropdownState = isOpen && canOpen ? 'open' : 'closed'

    return (
      <ToolbarDropdown
        className="branch-button"
        icon={icon}
        iconClassName={iconClassName}
        title={title}
        description={description}
        tooltip={tooltip}
        onDropdownStateChanged={this.onDropDownStateChanged}
        dropdownContentRenderer={this.renderBranchFoldout}
        dropdownState={currentState}
        disabled={disabled}
        showDisclosureArrow={canOpen}
        progressValue={progressValue}
      >
        {this.renderPullRequestInfo()}
      </ToolbarDropdown>
    )
  }

  private renderPullRequestInfo() {
    const pr = this.props.currentPullRequest
    const repository = this.props.repository.gitHubRepository

    if (pr === null || repository === null) {
      return null
    }

    return (
      <PullRequestBadge
        number={pr.pullRequestNumber}
        dispatcher={this.props.dispatcher}
        repository={repository}
      />
    )
  }
}
