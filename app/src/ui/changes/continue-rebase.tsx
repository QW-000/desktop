import * as React from 'react'
import { Button } from '../lib/button'
import { Loading } from '../lib/loading'
import { RebaseConflictState } from '../../lib/app-state'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { WorkingDirectoryStatus } from '../../models/status'
import { getConflictedFiles } from '../../lib/status'

interface IContinueRebaseProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly workingDirectory: WorkingDirectoryStatus
  readonly rebaseConflictState: RebaseConflictState
  readonly isCommitting: boolean
  readonly hasUntrackedChanges: boolean
}

export class ContinueRebase extends React.Component<IContinueRebaseProps, {}> {
  private onSubmit = async () => {
    const { rebaseConflictState } = this.props

    await this.props.dispatcher.continueRebase(
      this.props.repository,
      this.props.workingDirectory,
      rebaseConflictState
    )
  }

  public render() {
    const { manualResolutions } = this.props.rebaseConflictState

    let canCommit = true
    let tooltip = '繼續變基'

    const conflictedFilesCount = getConflictedFiles(
      this.props.workingDirectory,
      manualResolutions
    ).length

    if (conflictedFilesCount > 0) {
      tooltip = '在繼續之前解決全部衝突'
      canCommit = false
    }

    const buttonEnabled = canCommit && !this.props.isCommitting

    const loading = this.props.isCommitting ? <Loading /> : undefined

    const warnAboutUntrackedFiles = this.props.hasUntrackedChanges ? (
      <div className="warning-untracked-files">
        未跟踪的檔案將被排除
      </div>
    ) : undefined

    return (
      <div id="continue-rebase">
        <Button
          type="submit"
          className="commit-button"
          onClick={this.onSubmit}
          disabled={!buttonEnabled}
          tooltip={tooltip}
        >
          {loading}
          <span>{loading !== undefined ? '變基' : '繼續變基'}</span>
        </Button>

        {warnAboutUntrackedFiles}
      </div>
    )
  }
}
