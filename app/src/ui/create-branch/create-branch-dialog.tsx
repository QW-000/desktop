import * as React from 'react'

import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { sanitizedRefName } from '../../lib/sanitize-ref-name'
import { Branch, StartPoint } from '../../models/branch'
import { TextBox } from '../lib/text-box'
import { Row } from '../lib/row'
import { Ref } from '../lib/ref'
import { LinkButton } from '../lib/link-button'
import { Dialog, DialogError, DialogContent, DialogFooter } from '../dialog'
import {
  VerticalSegmentedControl,
  ISegmentedItem,
} from '../lib/vertical-segmented-control'
import {
  TipState,
  IUnbornRepository,
  IDetachedHead,
  IValidBranch,
} from '../../models/tip'
import { assertNever } from '../../lib/fatal-error'
import {
  renderBranchNameWarning,
  renderBranchNameExistsOnRemoteWarning,
} from '../lib/branch-name-warnings'
import { getStartPoint } from '../../lib/create-branch'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { startTimer } from '../lib/timing'
import {
  UncommittedChangesStrategy,
  UncommittedChangesStrategyKind,
} from '../../models/uncommitted-changes-strategy'
import { GitHubRepository } from '../../models/github-repository'

interface ICreateBranchProps {
  readonly repository: Repository
  readonly upstreamGitHubRepository: GitHubRepository | null
  readonly dispatcher: Dispatcher
  readonly onDismissed: () => void
  readonly tip: IUnbornRepository | IDetachedHead | IValidBranch
  readonly defaultBranch: Branch | null
  readonly upstreamDefaultBranch: Branch | null
  readonly allBranches: ReadonlyArray<Branch>
  readonly initialName: string
  readonly currentBranchProtected: boolean
  readonly selectedUncommittedChangesStrategy: UncommittedChangesStrategy
}

interface ICreateBranchState {
  readonly currentError: Error | null
  readonly proposedName: string
  readonly sanitizedName: string
  readonly startPoint: StartPoint

  /**
   * Whether or not the dialog is currently creating a branch. This affects
   * the dialog loading state as well as the rendering of the branch selector.
   *
   * When the dialog is creating a branch we take the tip and defaultBranch
   * as they were in props at the time of creation and stick them in state
   * so that we can maintain the layout of the branch selection parts even
   * as the Tip changes during creation.
   *
   * Note: once branch creation has been initiated this value stays at true
   * and will never revert to being false. If the branch creation operation
   * fails this dialog will still be dismissed and an error dialog will be
   * shown in its place.
   */
  readonly isCreatingBranch: boolean

  /**
   * The tip of the current repository, captured from props at the start
   * of the create branch operation.
   */
  readonly tipAtCreateStart: IUnbornRepository | IDetachedHead | IValidBranch

  /**
   * The default branch of the current repository, captured from props at the
   * start of the create branch operation.
   */
  readonly defaultBranchAtCreateStart: Branch | null
}

/** Only used for the `onBaseBranchChanged` callback */
enum SelectedBranch {
  DefaultishBranch = 0,
  CurrentBranch = 1,
}

/** The Create Branch component. */
export class CreateBranch extends React.Component<
  ICreateBranchProps,
  ICreateBranchState
> {
  public constructor(props: ICreateBranchProps) {
    super(props)

    const startPoint = getStartPoint(props, StartPoint.UpstreamDefaultBranch)

    this.state = {
      currentError: null,
      proposedName: props.initialName,
      sanitizedName: '',
      startPoint,
      isCreatingBranch: false,
      tipAtCreateStart: props.tip,
      defaultBranchAtCreateStart: getBranchForStartPoint(startPoint, props),
    }
  }

  public componentDidMount() {
    if (this.state.proposedName.length) {
      this.updateBranchName(this.state.proposedName)
    }
  }

  public componentWillReceiveProps(nextProps: ICreateBranchProps) {
    this.setState({
      startPoint: getStartPoint(nextProps, this.state.startPoint),
    })

    if (!this.state.isCreatingBranch) {
      const defaultStartPoint = getStartPoint(
        nextProps,
        StartPoint.UpstreamDefaultBranch
      )

      this.setState({
        tipAtCreateStart: nextProps.tip,
        defaultBranchAtCreateStart: getBranchForStartPoint(
          defaultStartPoint,
          nextProps
        ),
      })
    }
  }

  private renderBranchSelection() {
    const tip = this.state.isCreatingBranch
      ? this.state.tipAtCreateStart
      : this.props.tip

    const tipKind = tip.kind

    if (tip.kind === TipState.Detached) {
      return (
        <p>
          您目前沒有簽出任何分支 (您的 HEAD 引用已分離)
          因此，新分支將基於當前簽出的提交 ({tip.currentSha.substr(0, 7)}
          )。
        </p>
      )
    } else if (tip.kind === TipState.Unborn) {
      return (
        <p>
          您當前的分支是原生的 (無任何提交)。 建立新分支將重新命名當前分支。
        </p>
      )
    } else if (tip.kind === TipState.Valid) {
      if (
        this.props.upstreamGitHubRepository !== null &&
        this.props.upstreamDefaultBranch !== null
      ) {
        return this.renderForkBranchSelection(
          tip.branch.name,
          this.props.upstreamDefaultBranch,
          this.props.upstreamGitHubRepository.fullName
        )
      }

      const defaultBranch = this.state.isCreatingBranch
        ? this.props.defaultBranch
        : this.state.defaultBranchAtCreateStart

      return this.renderRegularBranchSelection(tip.branch.name, defaultBranch)
    } else {
      return assertNever(tip, `Unknown tip kind ${tipKind}`)
    }
  }

  private onBaseBranchChanged = (selection: SelectedBranch) => {
    if (selection === SelectedBranch.DefaultishBranch) {
      // is this a fork?
      if (
        this.props.upstreamGitHubRepository !== null &&
        this.props.upstreamDefaultBranch !== null
      ) {
        this.setState({
          startPoint: StartPoint.UpstreamDefaultBranch,
        })
      } else {
        this.setState({ startPoint: StartPoint.DefaultBranch })
      }
    } else if (selection === SelectedBranch.CurrentBranch) {
      this.setState({ startPoint: StartPoint.CurrentBranch })
    } else {
      throw new Error(`Unknown branch selection: ${selection}`)
    }
  }

  public render() {
    const disabled =
      this.state.proposedName.length <= 0 ||
      !!this.state.currentError ||
      /^\s*$/.test(this.state.sanitizedName)
    const error = this.state.currentError

    return (
      <Dialog
        id="create-branch"
        title={__DARWIN__ ? 'Create a Branch' : '建立一項分支'}
        onSubmit={this.createBranch}
        onDismissed={this.props.onDismissed}
        loading={this.state.isCreatingBranch}
        disabled={this.state.isCreatingBranch}
      >
        {error ? <DialogError>{error.message}</DialogError> : null}

        <DialogContent>
          <Row>
            <TextBox
              label="名稱"
              value={this.state.proposedName}
              autoFocus={true}
              onValueChanged={this.onBranchNameChange}
            />
          </Row>

          {renderBranchNameWarning(
            this.state.proposedName,
            this.state.sanitizedName
          )}

          {renderBranchNameExistsOnRemoteWarning(
            this.state.sanitizedName,
            this.props.allBranches
          )}

          {this.renderBranchSelection()}
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={__DARWIN__ ? 'Create Branch' : '建立分支'}
            okButtonDisabled={disabled}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onBranchNameChange = (name: string) => {
    this.updateBranchName(name)
  }

  private updateBranchName(name: string) {
    const sanitizedName = sanitizedRefName(name)
    const alreadyExists =
      this.props.allBranches.findIndex(b => b.name === sanitizedName) > -1

    const currentError = alreadyExists
      ? new Error(`名為 ${sanitizedName} 的分支已存在`)
      : null

    this.setState({
      proposedName: name,
      sanitizedName,
      currentError,
    })
  }

  private createBranch = async () => {
    const name = this.state.sanitizedName

    let startPoint: string | null = null
    let noTrack = false

    const {
      defaultBranch,
      upstreamDefaultBranch,
      currentBranchProtected,
      repository,
    } = this.props

    if (this.state.startPoint === StartPoint.DefaultBranch) {
      // This really shouldn't happen, we take all kinds of precautions
      // to make sure the startPoint state is valid given the current props.
      if (!defaultBranch) {
        this.setState({
          currentError: new Error('無法確定預設分支'),
        })
        return
      }

      startPoint = defaultBranch.name
    }
    if (this.state.startPoint === StartPoint.UpstreamDefaultBranch) {
      // This really shouldn't happen, we take all kinds of precautions
      // to make sure the startPoint state is valid given the current props.
      if (!upstreamDefaultBranch) {
        this.setState({
          currentError: new Error('無法確定預設分支'),
        })
        return
      }

      startPoint = upstreamDefaultBranch.name
      noTrack = true
    }

    if (name.length > 0) {
      // never prompt to stash changes if someone is switching away from a protected branch
      const strategy: UncommittedChangesStrategy = currentBranchProtected
        ? {
            kind: UncommittedChangesStrategyKind.MoveToNewBranch,
            transientStashEntry: null,
          }
        : this.props.selectedUncommittedChangesStrategy

      this.setState({ isCreatingBranch: true })
      const timer = startTimer('建立分支', repository)
      await this.props.dispatcher.createBranch(
        repository,
        name,
        startPoint,
        strategy,
        noTrack
      )
      timer.done()
    }
  }

  /**
   * Render options for a non-fork repository
   *
   * Gives user the option to make a new branch from
   * the default branch.
   */
  private renderRegularBranchSelection(
    currentBranchName: string,
    defaultBranch: Branch | null
  ) {
    if (defaultBranch === null || defaultBranch.name === currentBranchName) {
      return (
        <p>
          您的新分支將基於當前 (
          <Ref>{currentBranchName}</Ref>
          ) 分支簽出。 <Ref>{currentBranchName}</Ref> 是您的 {defaultBranchLink}  存儲庫。
        </p>
      )
    } else {
      const items = [
        {
          title: defaultBranch.name,
          description:
            "存儲庫中的預設分支。 選擇此選項以開始一些不依賴於當前分支的新內容。",
        },
        {
          title: currentBranchName,
          description:
            '當前簽出的分支。 如果您需要在此分支中完成工作，請選擇此選項。',
        },
      ]

      const selectedIndex =
        this.state.startPoint === StartPoint.DefaultBranch ? 0 : 1

      return this.renderOptions(items, selectedIndex)
    }
  }

  /**
   * Render options if we're in a fork
   *
   * Gives user the option to make a new branch from
   * the upstream default branch.
   */
  private renderForkBranchSelection(
    currentBranchName: string,
    upstreamDefaultBranch: Branch,
    upstreamRepositoryFullName: string
  ) {
    // we assume here that the upstream and this
    // fork will have the same default branch name
    if (currentBranchName === upstreamDefaultBranch.nameWithoutRemote) {
      return (
        <p>
          您的新分支將基於 {' '}
          <strong>{upstreamRepositoryFullName}</strong>
          的 {defaultBranchLink} (
          <Ref>{upstreamDefaultBranch.nameWithoutRemote}</Ref>)。
        </p>
      )
    } else {
      const items = [
        {
          title: upstreamDefaultBranch.name,
          description:
            "上游存儲庫的預設分支。 選擇此選項以開始一些不依賴於當前分支的新內容。",
        },
        {
          title: currentBranchName,
          description:
            '當前簽出的分支。 如果您需要在此分支中完成工作，請選擇此選項。',
        },
      ]

      const selectedIndex =
        this.state.startPoint === StartPoint.UpstreamDefaultBranch ? 0 : 1

      return this.renderOptions(items, selectedIndex)
    }
  }

  /** Shared method for rendering two choices in this component */
  private renderOptions = (
    items: ReadonlyArray<ISegmentedItem>,
    selectedIndex: number
  ) => (
    <Row>
      <VerticalSegmentedControl
        label="建立基本分支…"
        items={items}
        selectedIndex={selectedIndex}
        onSelectionChanged={this.onBaseBranchChanged}
      />
    </Row>
  )
}

/** Reusable snippet */
const defaultBranchLink = (
  <LinkButton uri="https://help.github.com/articles/setting-the-default-branch/">
    預設分支
  </LinkButton>
)

/** Given some branches and a start point, return the proper branch */
function getBranchForStartPoint(
  startPoint: StartPoint,
  branchInfo: {
    readonly defaultBranch: Branch | null
    readonly upstreamDefaultBranch: Branch | null
  }
) {
  return startPoint === StartPoint.UpstreamDefaultBranch
    ? branchInfo.upstreamDefaultBranch
    : startPoint === StartPoint.DefaultBranch
    ? branchInfo.defaultBranch
    : null
}
