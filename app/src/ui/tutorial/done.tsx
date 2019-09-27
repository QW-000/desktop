import * as React from 'react'

import { encodePathAsUrl } from '../../lib/path'
import { Button } from '../lib/button'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { PopupType } from '../../models/popup'

const ClappingHandsImage = encodePathAsUrl(
  __dirname,
  'static/admin-mentoring.svg'
)
const ExploreImage = encodePathAsUrl(__dirname, 'static/explore.svg')
const NewRepoImage = encodePathAsUrl(__dirname, 'static/repo-template.svg')
const FolderImage = encodePathAsUrl(__dirname, 'static/file-directory.svg')

interface ITutorialDoneProps {
  readonly dispatcher: Dispatcher

  /**
   * The currently selected repository
   */
  readonly repository: Repository
}
export class TutorialDone extends React.Component<ITutorialDoneProps, {}> {
  public render() {
    return (
      <div id="no-changes">
        <div className="content">
          <div className="header">
            <div className="text">
              <h1>你完成了!</h1>
              <p>
                您已經了解有關如何使用 GitHub Desktop 的基本知識。 以下是有關下一步操作的一些建議。
              </p>
            </div>
            <img src={ClappingHandsImage} className="blankslate-image" />
          </div>
          {this.renderActions()}
        </div>
      </div>
    )
  }

  private renderActions() {
    return (
      <ul className="actions">
        {this.renderExploreProjects()}
        {this.renderStartNewProject()}
        {this.renderAddLocalRepo()}
      </ul>
    )
  }

  private renderExploreProjects() {
    return (
      <li className="blankslate-action">
        <div className="image-wrapper">
          <img src={ExploreImage} />
        </div>
        <div className="text-wrapper">
          <h2>在 GitHub 上探索項目</h2>
          <p className="description">
            有助於您感興趣的項目
          </p>
        </div>
        <Button onClick={this.openDotcomExplore}>
          {__DARWIN__ ? 'Open in Browser' : '在瀏覽器中開啟'}
        </Button>
      </li>
    )
  }

  private renderStartNewProject() {
    return (
      <li className="blankslate-action">
        <div className="image-wrapper">
          <img src={NewRepoImage} />
        </div>
        <div className="text-wrapper">
          <h2>開始一個新項目</h2>
          <p className="description">建立一項新的存儲庫</p>
        </div>
        <Button onClick={this.onCreateNewRepository}>
          {__DARWIN__ ? 'Create Repository' : '建立存儲庫'}
        </Button>
      </li>
    )
  }

  private renderAddLocalRepo() {
    return (
      <li className="blankslate-action">
        <div className="image-wrapper">
          <img src={FolderImage} />
        </div>
        <div className="text-wrapper">
          <h2>增加本機存儲庫</h2>
          <p className="description">
            在 GitHub Desktop 上現有項目作業
          </p>
        </div>
        <Button onClick={this.onAddExistingRepository}>
          {__DARWIN__ ? 'Add Repository' : '增加存儲庫'}
        </Button>
      </li>
    )
  }

  private openDotcomExplore = () => {
    this.props.dispatcher.showGitHubExplore(this.props.repository)
  }

  private onCreateNewRepository = () => {
    this.props.dispatcher.showPopup({
      type: PopupType.CreateRepository,
    })
  }

  private onAddExistingRepository = () => {
    this.props.dispatcher.showPopup({
      type: PopupType.AddRepository,
    })
  }
}
