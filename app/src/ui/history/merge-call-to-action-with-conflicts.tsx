import * as React from 'react'

import { HistoryTabMode } from '../../lib/app-state'
import { Repository } from '../../models/repository'
import { Branch } from '../../models/branch'
import { Dispatcher } from '../dispatcher'
import { Button } from '../lib/button'
import { ActionStatusIcon } from '../lib/action-status-icon'
import { MergeResult } from '../../models/merge'
import { ComputedAction } from '../../models/computed-action'

interface IMergeCallToActionWithConflictsProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly mergeStatus: MergeResult | null
  readonly currentBranch: Branch
  readonly comparisonBranch: Branch
  readonly commitsBehind: number

  /**
   * Callback to execute after a merge has been performed
   */
  readonly onMerged: () => void
}

export class MergeCallToActionWithConflicts extends React.Component<
  IMergeCallToActionWithConflictsProps,
  {}
> {
  public render() {
    const { commitsBehind } = this.props

    const cannotMergeBranch =
      this.props.mergeStatus != null &&
      this.props.mergeStatus.kind === ComputedAction.Invalid

    const disabled = commitsBehind <= 0 || cannotMergeBranch

    const mergeDetails = commitsBehind > 0 ? this.renderMergeStatus() : null

    return (
      <div className="merge-cta">
        {mergeDetails}

        <Button type="submit" disabled={disabled} onClick={this.onMergeClicked}>
          合併到 <strong>{this.props.currentBranch.name}</strong>
        </Button>
      </div>
    )
  }

  private renderMergeStatus() {
    return (
      <div className="merge-status-component">
        <ActionStatusIcon
          status={this.props.mergeStatus}
          classNamePrefix="merge-status"
        />

        {this.renderMergeDetails(
          this.props.currentBranch,
          this.props.comparisonBranch,
          this.props.mergeStatus,
          this.props.commitsBehind
        )}
      </div>
    )
  }

  private renderMergeDetails(
    currentBranch: Branch,
    comparisonBranch: Branch,
    mergeStatus: MergeResult | null,
    behindCount: number
  ) {
    if (mergeStatus === null) {
      return null
    }

    if (mergeStatus.kind === ComputedAction.Loading) {
      return this.renderLoadingMergeMessage()
    }
    if (mergeStatus.kind === ComputedAction.Clean) {
      return this.renderCleanMergeMessage(
        currentBranch,
        comparisonBranch,
        behindCount
      )
    }
    if (mergeStatus.kind === ComputedAction.Invalid) {
      return this.renderInvalidMergeMessage()
    }
    if (mergeStatus.kind === ComputedAction.Conflicts) {
      return this.renderConflictedMergeMessage(
        currentBranch,
        comparisonBranch,
        mergeStatus.conflictedFiles
      )
    }
    return null
  }

  private renderLoadingMergeMessage() {
    return (
      <div className="merge-message merge-message-loading">
        檢查自動合併的能力...
      </div>
    )
  }

  private renderCleanMergeMessage(
    currentBranch: Branch,
    branch: Branch,
    count: number
  ) {
    if (count > 0) {
      const pluralized = count === 1 ? '提交' : '提交'
      return (
        <div className="merge-message">
          這將合併
          <strong>{` ${count} ${pluralized}`}</strong>
          {` 從 `}
          <strong>{branch.name}</strong>
          {` 到 `}
          <strong>{currentBranch.name}</strong>
        </div>
      )
    } else {
      return null
    }
  }

  private renderInvalidMergeMessage() {
    return (
      <div className="merge-message">
        無法在此存儲庫中合併不相關的歷程記錄
      </div>
    )
  }

  private renderConflictedMergeMessage(
    currentBranch: Branch,
    branch: Branch,
    count: number
  ) {
    const pluralized = count === 1 ? '檔案' : '檔案'
    return (
      <div className="merge-message">
        將由
        <strong>{` ${count} 衝突 ${pluralized}`}</strong>
        {` 合併於 `}
        <strong>{branch.name}</strong>
        {` 到 `}
        <strong>{currentBranch.name}</strong>
      </div>
    )
  }

  private onMergeClicked = async () => {
    const { comparisonBranch, repository, mergeStatus } = this.props

    this.props.dispatcher.recordCompareInitiatedMerge()

    await this.props.dispatcher.mergeBranch(
      repository,
      comparisonBranch.name,
      mergeStatus
    )

    this.props.dispatcher.executeCompare(repository, {
      kind: HistoryTabMode.History,
    })

    this.props.dispatcher.updateCompareForm(repository, {
      showBranchList: false,
      filterText: '',
    })
    this.props.onMerged()
  }
}
