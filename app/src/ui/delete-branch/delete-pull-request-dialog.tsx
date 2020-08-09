import * as React from 'react'

import { Dispatcher } from '../dispatcher'

import { Repository } from '../../models/repository'
import { Branch } from '../../models/branch'
import { PullRequest } from '../../models/pull-request'

import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { LinkButton } from '../lib/link-button'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IDeleteBranchProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly branch: Branch
  readonly pullRequest: PullRequest
  readonly onDismissed: () => void
}

export class DeletePullRequest extends React.Component<IDeleteBranchProps, {}> {
  public render() {
    return (
      <Dialog
        id="delete-branch"
        title={__DARWIN__ ? 'Delete Branch' : '刪除分支'}
        type="warning"
        onDismissed={this.props.onDismissed}
        onSubmit={this.deleteBranch}
      >
        <DialogContent>
          <p>此分支具有與之關聯的開放拉取請求。</p>
          <p>
            要是{' '}
            <LinkButton onClick={this.openPullRequest}>
              #{this.props.pullRequest.pullRequestNumber}
            </LinkButton>{' '}
            已經合併，你也可以刪除 GitHub 上的遠端分支。
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup destructive={true} okButtonText="刪除" />
        </DialogFooter>
      </Dialog>
    )
  }

  private openPullRequest = () => {
    this.props.dispatcher.showPullRequest(this.props.repository)
  }

  private deleteBranch = () => {
    this.props.dispatcher.deleteBranch(
      this.props.repository,
      this.props.branch,
      false
    )

    return this.props.onDismissed()
  }
}
