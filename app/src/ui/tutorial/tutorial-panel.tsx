import * as React from 'react'
import { join } from 'path'
import { LinkButton } from '../lib/link-button'
import { Button } from '../lib/button'
import { Monospaced } from '../lib/monospaced'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { Octicon, OcticonSymbol } from '../octicons'
import {
  ValidTutorialStep,
  TutorialStep,
  orderedTutorialSteps,
} from '../../models/tutorial-step'
import { encodePathAsUrl } from '../../lib/path'
import { ExternalEditor } from '../../lib/editors'
import { PopupType } from '../../models/popup'
import { PreferencesTab } from '../../models/preferences'

const TutorialPanelImage = encodePathAsUrl(
  __dirname,
  'static/required-status-check.svg'
)

interface ITutorialPanelProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository

  /** name of the configured external editor
   * (`undefined` if none is configured.)
   */
  readonly resolvedExternalEditor: ExternalEditor | null
  readonly currentTutorialStep: ValidTutorialStep
  readonly onExitTutorial: () => void
}

interface ITutorialPanelState {
  /** ID of the currently expanded tutorial step */
  readonly currentlyOpenSectionId: ValidTutorialStep
}

/** The Onboarding Tutorial Panel
 *  Renders a list of expandable tutorial steps (`TutorialListItem`).
 *  Enforces only having one step expanded at a time through
 *  event callbacks and local state.
 */
export class TutorialPanel extends React.Component<
  ITutorialPanelProps,
  ITutorialPanelState
> {
  public constructor(props: ITutorialPanelProps) {
    super(props)
    this.state = { currentlyOpenSectionId: this.props.currentTutorialStep }
  }

  private openTutorialFileInEditor = () => {
    this.props.dispatcher.openInExternalEditor(
      // TODO: tie this filename to a shared constant
      // for tutorial repos
      join(this.props.repository.path, 'README.md')
    )
  }

  private openPullRequest = () => {
    this.props.dispatcher.createPullRequest(this.props.repository)
  }

  private skipEditorInstall = () => {
    this.props.dispatcher.skipPickEditorTutorialStep(this.props.repository)
  }

  private skipCreatePR = () => {
    this.props.dispatcher.markPullRequestTutorialStepAsComplete(
      this.props.repository
    )
  }

  private isStepComplete = (step: ValidTutorialStep) => {
    return (
      orderedTutorialSteps.indexOf(step) <
      orderedTutorialSteps.indexOf(this.props.currentTutorialStep)
    )
  }

  private isStepNextTodo = (step: ValidTutorialStep) => {
    return step === this.props.currentTutorialStep
  }

  public componentWillReceiveProps(nextProps: ITutorialPanelProps) {
    if (this.props.currentTutorialStep !== nextProps.currentTutorialStep) {
      this.setState({
        currentlyOpenSectionId: nextProps.currentTutorialStep,
      })
    }
  }

  public render() {
    return (
      <div className="tutorial-panel-component panel">
        <div className="titleArea">
          <h3>開始吧</h3>
          <img src={TutorialPanelImage} />
        </div>
        <ol>
          <TutorialStepInstructions
            summaryText="安裝本文編輯器"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.PickEditor}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            skipLinkButton={<SkipLinkButton onClick={this.skipEditorInstall} />}
            onSummaryClick={this.onStepSummaryClick}
          >
            {!this.isStepComplete(TutorialStep.PickEditor) ? (
              <>
                <p className="description">
                  您似乎沒有安裝本文編輯器。 我們可以推薦{' '}
                  <LinkButton
                    uri="https://atom.io"
                    title="開啟 Atom 網站"
                  >
                    Atom
                  </LinkButton>
                  {` 或 `}
                  <LinkButton
                    uri="https://code.visualstudio.com"
                    title="開啟 VS 程式碼網站"
                  >
                    Visual Studio 程式碼
                  </LinkButton>
                  可隨時使用。
                </p>
                <div className="action">
                  <LinkButton onClick={this.skipEditorInstall}>
                    我已有編輯器
                  </LinkButton>
                </div>
              </>
            ) : (
              <p className="description">
                您的預設編輯器是{' '}
                <strong>{this.props.resolvedExternalEditor}</strong>。 您可以
                  在{' '}
                <LinkButton onClick={this.onPreferencesClick}>
                  {__DARWIN__ ? '偏好' : '選項'}
                </LinkButton>中更改您喜歡的編輯器
              </p>
            )}
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="建立分支"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.CreateBranch}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              {`「分支」可讓你同時處理不同型式的存儲庫。 經由功能表的「分支」頂部欄中並點擊 "${__DARWIN__ ? '新分支' : '新分支'}"來建立分支。`}
            </p>
            <div className="action">
              {__DARWIN__ ? (
                <>
                  <kbd>⌘</kbd>
                  <kbd>⇧</kbd>
                  <kbd>N</kbd>
                </>
              ) : (
                <>
                  <kbd>Ctrl</kbd>
                  <kbd>Shift</kbd>
                  <kbd>N</kbd>
                </>
              )}
            </div>
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="編輯檔案"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.EditFile}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              在首選的本文編輯器中開啟此存儲庫。 編輯此
              {` `}
              <Monospaced>README.md</Monospaced>
              {` `}
              檔案，儲存並返回。
            </p>
            {this.props.resolvedExternalEditor && (
              <div className="action">
                <Button onClick={this.openTutorialFileInEditor}>
                  {__DARWIN__ ? '開啟編輯器' : '開啟編輯器'}
                </Button>
                {__DARWIN__ ? (
                  <>
                    <kbd>⌘</kbd>
                    <kbd>⇧</kbd>
                    <kbd>A</kbd>
                  </>
                ) : (
                  <>
                    <kbd>Ctrl</kbd>
                    <kbd>Shift</kbd>
                    <kbd>A</kbd>
                  </>
                )}
              </div>
            )}
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="製作提交"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.MakeCommit}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              「提交」允許您儲存變更集。 在左下角的“摘要”欄填寫描述您所做的變更訊息。 當您完成後，點擊藍色的「提交」按鈕即可完成。
            </p>
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="發布到 GitHub"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.PushBranch}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              「發布」將會“推送”或上傳你的提交到 GitHub 上的存儲庫分支。使用頂部欄中的第三個按鈕進行發布。
            </p>
            <div className="action">
              {__DARWIN__ ? (
                <>
                  <kbd>⌘</kbd>
                  <kbd>P</kbd>
                </>
              ) : (
                <>
                  <kbd>Ctrl</kbd>
                  <kbd>P</kbd>
                </>
              )}
            </div>
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="開啟拉取請求"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.OpenPullRequest}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            skipLinkButton={<SkipLinkButton onClick={this.skipCreatePR} />}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              「拉取請求」允許您提出對程式碼的變更。 經由開啟一個拉取請求將有專人審核並合併。 由於這是一個展示存儲庫，因此該拉取請求將是私有的。
            </p>
            <div className="action">
              <Button onClick={this.openPullRequest}>
                {__DARWIN__ ? '開啟拉取請求' : '開啟拉取請求'}
                <Octicon symbol={OcticonSymbol.linkExternal} />
              </Button>
              {__DARWIN__ ? (
                <>
                  <kbd>⌘</kbd>
                  <kbd>R</kbd>
                </>
              ) : (
                <>
                  <kbd>Ctrl</kbd>
                  <kbd>R</kbd>
                </>
              )}
            </div>
          </TutorialStepInstructions>
        </ol>
        <div className="footer">
          <Button onClick={this.props.onExitTutorial}>
            {__DARWIN__ ? '離開教學' : '離開教學'}
          </Button>
        </div>
      </div>
    )
  }
  /** this makes sure we only have one `TutorialListItem` open at a time */
  public onStepSummaryClick = (id: ValidTutorialStep) => {
    this.setState({ currentlyOpenSectionId: id })
  }

  private onPreferencesClick = () => {
    this.props.dispatcher.showPopup({
      type: PopupType.Preferences,
      initialSelectedTab: PreferencesTab.Advanced,
    })
  }
}

interface ITutorialStepInstructionsProps {
  /** Text displayed to summarize this step */
  readonly summaryText: string
  /** Used to find out if this step has been completed */
  readonly isComplete: (step: ValidTutorialStep) => boolean
  /** The step for this section */
  readonly sectionId: ValidTutorialStep
  /** Used to find out if this is the next step for the user to complete */
  readonly isNextStepTodo: (step: ValidTutorialStep) => boolean

  /** ID of the currently expanded tutorial step
   * (used to determine if this step is expanded)
   */
  readonly currentlyOpenSectionId: ValidTutorialStep

  /** Skip button (if possible for this step) */
  readonly skipLinkButton?: JSX.Element
  /** Handler to open and close section */
  readonly onSummaryClick: (id: ValidTutorialStep) => void
}

/** A step (summary and expandable description) in the tutorial side panel */
class TutorialStepInstructions extends React.Component<
  ITutorialStepInstructionsProps
> {
  public render() {
    return (
      <li key={this.props.sectionId} onClick={this.onSummaryClick}>
        <details
          open={this.props.sectionId === this.props.currentlyOpenSectionId}
          onClick={this.onSummaryClick}
        >
          {this.renderSummary()}
          <div className="contents">{this.props.children}</div>
        </details>
      </li>
    )
  }

  private renderSummary = () => {
    const shouldShowSkipLink =
      this.props.skipLinkButton !== undefined &&
      this.props.currentlyOpenSectionId === this.props.sectionId &&
      this.props.isNextStepTodo(this.props.sectionId)
    return (
      <summary>
        {this.renderTutorialStepIcon()}
        <span className="summary-text">{this.props.summaryText}</span>
        <span className="hang-right">
          {shouldShowSkipLink ? (
            this.props.skipLinkButton
          ) : (
            <Octicon symbol={OcticonSymbol.chevronDown} />
          )}
        </span>
      </summary>
    )
  }

  private renderTutorialStepIcon() {
    if (this.props.isComplete(this.props.sectionId)) {
      return (
        <div className="green-circle">
          <Octicon symbol={OcticonSymbol.check} />
        </div>
      )
    }

    // ugh zero-indexing
    const stepNumber = orderedTutorialSteps.indexOf(this.props.sectionId) + 1
    return this.props.isNextStepTodo(this.props.sectionId) ? (
      <div className="blue-circle">{stepNumber}</div>
    ) : (
      <div className="empty-circle">{stepNumber}</div>
    )
  }

  private onSummaryClick = (e: React.MouseEvent<HTMLElement>) => {
    // prevents the default behavior of toggling on a `details` html element
    // so we don't have to fight it with our react state
    // for more info see:
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#Events
    e.preventDefault()
    this.props.onSummaryClick(this.props.sectionId)
  }
}

const SkipLinkButton: React.FunctionComponent<{
  onClick: () => void
}> = props => <LinkButton onClick={props.onClick}>略過</LinkButton>
