import * as React from 'react'

import { encodePathAsUrl } from '../../lib/path'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { PopupType } from '../../models/popup'
import { Octicon, OcticonSymbol } from '../octicons'
import { SuggestedAction } from '../suggested-actions'
import { SuggestedActionGroup } from '../suggested-actions'

const ClappingHandsImage = encodePathAsUrl(
  __dirname,
  'static/admin-mentoring.svg'
)

const TelescopeOcticon = <Octicon symbol={OcticonSymbol.telescope} />
const PlusOcticon = <Octicon symbol={OcticonSymbol.plus} />
const FileDirectoryOcticon = <Octicon symbol={OcticonSymbol.fileDirectory} />

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
      <div id="tutorial-done">
        <div className="content">
          <div className="header">
            <div className="text">
              <h1>你完成了!</h1>
              <p>
                您已經了解有關如何使用 GitHub Desktop 的基本知識。 以下是有關下一步操作的一些建議。
              </p>
            </div>
            <img src={ClappingHandsImage} className="image" />
          </div>
          <SuggestedActionGroup>
            <SuggestedAction
              title="在 GitHub 上探索項目"
              description="有助於您感興趣的項目"
              buttonText={__DARWIN__ ? '在瀏覽器中開啟' : '在瀏覽器中開啟'}
              onClick={this.openDotcomExplore}
              type="normal"
              image={TelescopeOcticon}
            />
            <SuggestedAction
              title="建立一個新的存儲庫"
              description="開始一個全新的項目"
              buttonText={
                __DARWIN__ ? '建立存儲庫' : '建立存儲庫'
              }
              onClick={this.onCreateNewRepository}
              type="normal"
              image={PlusOcticon}
            />
            <SuggestedAction
              title="增加本機存儲庫"
              description="在 GitHub Desktop 上現有項目作業"
              buttonText={__DARWIN__ ? '增加存儲庫' : '增加存儲庫'}
              onClick={this.onAddExistingRepository}
              type="normal"
              image={FileDirectoryOcticon}
            />
          </SuggestedActionGroup>
        </div>
      </div>
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
