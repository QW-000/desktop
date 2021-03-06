import * as React from 'react'

import { Row } from '../lib/row'
import { Button } from '../lib/button'
import {
  Dialog,
  DialogError,
  DialogContent,
  DefaultDialogFooter,
} from '../dialog'
import { LinkButton } from '../lib/link-button'
import { updateStore, IUpdateState, UpdateStatus } from '../lib/update-store'
import { Disposable } from 'event-kit'
import { Loading } from '../lib/loading'
import { RelativeTime } from '../relative-time'
import { assertNever } from '../../lib/fatal-error'
import { ReleaseNotesUri } from '../lib/releases'
import { encodePathAsUrl } from '../../lib/path'

const DesktopLogo = encodePathAsUrl(__dirname, 'static/logo-64x64@2x.png')

interface IAboutProps {
  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * The name of the currently installed (and running) application
   */
  readonly applicationName: string

  /**
   * The currently installed (and running) version of the app.
   */
  readonly applicationVersion: string

  /** A function to call to kick off an update check. */
  readonly onCheckForUpdates: () => void

  readonly onShowAcknowledgements: () => void

  /** A function to call when the user wants to see Terms and Conditions. */
  readonly onShowTermsAndConditions: () => void
}

interface IAboutState {
  readonly updateState: IUpdateState
}

/**
 * A dialog that presents information about the
 * running application such as name and version.
 */
export class About extends React.Component<IAboutProps, IAboutState> {
  private updateStoreEventHandle: Disposable | null = null

  public constructor(props: IAboutProps) {
    super(props)

    this.state = {
      updateState: updateStore.state,
    }
  }

  private onUpdateStateChanged = (updateState: IUpdateState) => {
    this.setState({ updateState })
  }

  public componentDidMount() {
    this.updateStoreEventHandle = updateStore.onDidChange(
      this.onUpdateStateChanged
    )
    this.setState({ updateState: updateStore.state })
  }

  public componentWillUnmount() {
    if (this.updateStoreEventHandle) {
      this.updateStoreEventHandle.dispose()
      this.updateStoreEventHandle = null
    }
  }

  private onQuitAndInstall = () => {
    updateStore.quitAndInstallUpdate()
  }

  private renderUpdateButton() {
    if (
      __RELEASE_CHANNEL__ === 'development' ||
      __RELEASE_CHANNEL__ === 'test'
    ) {
      return null
    }

    const updateStatus = this.state.updateState.status

    switch (updateStatus) {
      case UpdateStatus.UpdateReady:
        return (
          <Row>
            <Button onClick={this.onQuitAndInstall}>
              結束並安裝更新
            </Button>
          </Row>
        )
      case UpdateStatus.UpdateNotAvailable:
      case UpdateStatus.CheckingForUpdates:
      case UpdateStatus.UpdateAvailable:
        const disabled = updateStatus !== UpdateStatus.UpdateNotAvailable

        return (
          <Row>
            <Button disabled={disabled} onClick={this.props.onCheckForUpdates}>
              檢查更新
            </Button>
          </Row>
        )
      default:
        return assertNever(
          updateStatus,
          `未知更新狀態 ${updateStatus}`
        )
    }
  }

  private renderCheckingForUpdate() {
    return (
      <Row className="update-status">
        <Loading />
        <span>檢查更新…</span>
      </Row>
    )
  }

  private renderUpdateAvailable() {
    return (
      <Row className="update-status">
        <Loading />
        <span>下載更新…</span>
      </Row>
    )
  }

  private renderUpdateNotAvailable() {
    const lastCheckedDate = this.state.updateState.lastSuccessfulCheck

    // This case is rendered as an error
    if (!lastCheckedDate) {
      return null
    }

    return (
      <p className="update-status">
        您有最新版本 (上次檢查 {' '}
        <RelativeTime date={lastCheckedDate} />)
      </p>
    )
  }

  private renderUpdateReady() {
    return (
      <p className="update-status">
        已下載更新並準備安裝。
      </p>
    )
  }

  private renderUpdateDetails() {
    if (__LINUX__) {
      return null
    }

    if (
      __RELEASE_CHANNEL__ === 'development' ||
      __RELEASE_CHANNEL__ === 'test'
    ) {
      return (
        <p>
          此應用程式目前正在開發或測試模式下執行，並不會收到任何更新。
        </p>
      )
    }

    const updateState = this.state.updateState

    switch (updateState.status) {
      case UpdateStatus.CheckingForUpdates:
        return this.renderCheckingForUpdate()
      case UpdateStatus.UpdateAvailable:
        return this.renderUpdateAvailable()
      case UpdateStatus.UpdateNotAvailable:
        return this.renderUpdateNotAvailable()
      case UpdateStatus.UpdateReady:
        return this.renderUpdateReady()
      default:
        return assertNever(
          updateState.status,
          `未知更新狀態 ${updateState.status}`
        )
    }
  }

  private renderUpdateErrors() {
    if (__LINUX__) {
      return null
    }

    if (
      __RELEASE_CHANNEL__ === 'development' ||
      __RELEASE_CHANNEL__ === 'test'
    ) {
      return null
    }

    if (!this.state.updateState.lastSuccessfulCheck) {
      return (
        <DialogError>
          無法確定上次執行更新檢查的時間。
          您可能正在執行舊版本，請嘗試手動檢查更新，如果問題仍然存在，請聯絡 GitHub 支援
          ________________________________________________________________________________
          注意:此版本無法取得官方版本的更新，上方警示請勿理會。
        </DialogError>
      )
    }

    return null
  }

  public render() {
    const name = this.props.applicationName
    const version = this.props.applicationVersion
    const releaseNotesLink = (
      <LinkButton uri={ReleaseNotesUri}>發行說明</LinkButton>
    )

    const versionText = __DEV__ ? `建置 ${version}` : `版本 ${version}`

    return (
      <Dialog
        id="about"
        onSubmit={this.props.onDismissed}
        onDismissed={this.props.onDismissed}
      >
        {this.renderUpdateErrors()}
        <DialogContent>
          <Row className="logo">
            <img
              src={DesktopLogo}
              alt="GitHub Desktop"
              width="64"
              height="64"
            />
          </Row>
          <h2>{name}</h2>
          <p className="no-padding">
            <span className="selectable-text">{versionText}</span> (
            {releaseNotesLink})
          </p>
          <p className="no-padding">
            <LinkButton onClick={this.props.onShowTermsAndConditions}>
              條款和條件
            </LinkButton>
          </p>
          <p>
            <LinkButton onClick={this.props.onShowAcknowledgements}>
              許可證和開源聲明
            </LinkButton>
          </p>
          {this.renderUpdateDetails()}
          {this.renderUpdateButton()}
        </DialogContent>
        <DefaultDialogFooter />
      </Dialog>
    )
  }
}
