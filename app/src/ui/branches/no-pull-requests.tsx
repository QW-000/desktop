import * as React from 'react'
import { encodePathAsUrl } from '../../lib/path'
import { Ref } from '../lib/ref'
import { LinkButton } from '../lib/link-button'

const BlankSlateImage = encodePathAsUrl(
  __dirname,
  'static/empty-no-pull-requests.svg'
)

interface INoPullRequestsProps {
  /** The name of the repository. */
  readonly repositoryName: string

  /** Is the default branch currently checked out? */
  readonly isOnDefaultBranch: boolean

  /** Is this component being rendered due to a search? */
  readonly isSearch: boolean

  /* Called when the user wants to create a new branch. */
  readonly onCreateBranch: () => void

  /** Called when the user wants to create a pull request. */
  readonly onCreatePullRequest: () => void

  /** Are we currently loading pull requests? */
  readonly isLoadingPullRequests: boolean
}

/** The placeholder for when there are no open pull requests. */
export class NoPullRequests extends React.Component<INoPullRequestsProps, {}> {
  public render() {
    return (
      <div className="no-pull-requests">
        <img src={BlankSlateImage} className="blankslate-image" />
        {this.renderTitle()}
        {this.renderCallToAction()}
      </div>
    )
  }

  private renderTitle() {
    if (this.props.isSearch) {
      return <div className="title">抱歉，無法找到拉取請求!</div>
    } else if (this.props.isLoadingPullRequests) {
      return <div className="title">Hang tight</div>
    } else {
      return (
        <div>
          <div className="title">你已經準備好了!</div>
          <div className="no-prs">
            沒有開啟 <Ref>{this.props.repositoryName}</Ref> 的拉取請求
          </div>
        </div>
      )
    }
  }

  private renderCallToAction() {
    if (this.props.isLoadingPullRequests) {
      return (
        <div className="call-to-action">
          盡可能加快載入拉取請求!
        </div>
      )
    }

    if (this.props.isOnDefaultBranch) {
      return (
        <div className="call-to-action">
          你是否想要 {' '}
          <LinkButton onClick={this.props.onCreateBranch}>
            建立新的分支
          </LinkButton>{' '}
          並開始你的下一個項目嗎?
        </div>
      )
    } else {
      return (
        <div className="call-to-action">
          你是否想要 {' '}
          <LinkButton onClick={this.props.onCreatePullRequest}>
            建立拉取請求
          </LinkButton>{' '}
          從當前分支?
        </div>
      )
    }
  }
}
