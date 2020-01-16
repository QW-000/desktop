import * as React from 'react'
import { Account } from '../../models/account'
import { PreferencesTab } from '../../models/preferences'
import { ExternalEditor } from '../../lib/editors'
import { Dispatcher } from '../dispatcher'
import { TabBar, TabBarType } from '../tab-bar'
import { Accounts } from './accounts'
import { Advanced } from './advanced'
import { Git } from './git'
import { assertNever } from '../../lib/fatal-error'
import { Dialog, DialogFooter, DialogError } from '../dialog'
import {
  getGlobalConfigValue,
  setGlobalConfigValue,
  getMergeTool,
  IMergeTool,
} from '../../lib/git/config'
import { lookupPreferredEmail } from '../../lib/email'
import { Shell, getAvailableShells } from '../../lib/shells'
import { getAvailableEditors } from '../../lib/editors/lookup'
import { gitAuthorNameIsValid } from './identifier-rules'
import { Appearance } from './appearance'
import { ApplicationTheme } from '../lib/application-theme'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Integrations } from './integrations'
import {
  UncommittedChangesStrategyKind,
  uncommittedChangesStrategyKindDefault,
} from '../../models/uncommitted-changes-strategy'
import { Octicon, OcticonSymbol } from '../octicons'

interface IPreferencesProps {
  readonly dispatcher: Dispatcher
  readonly dotComAccount: Account | null
  readonly enterpriseAccount: Account | null
  readonly onDismissed: () => void
  readonly optOutOfUsageTracking: boolean
  readonly initialSelectedTab?: PreferencesTab
  readonly confirmRepositoryRemoval: boolean
  readonly confirmDiscardChanges: boolean
  readonly confirmForcePush: boolean
  readonly uncommittedChangesStrategyKind: UncommittedChangesStrategyKind
  readonly selectedExternalEditor: ExternalEditor | null
  readonly selectedShell: Shell
  readonly selectedTheme: ApplicationTheme
  readonly automaticallySwitchTheme: boolean
}

interface IPreferencesState {
  readonly selectedIndex: PreferencesTab
  readonly committerName: string
  readonly committerEmail: string
  readonly disallowedCharactersMessage: string | null
  readonly optOutOfUsageTracking: boolean
  readonly confirmRepositoryRemoval: boolean
  readonly confirmDiscardChanges: boolean
  readonly confirmForcePush: boolean
  readonly automaticallySwitchTheme: boolean
  readonly uncommittedChangesStrategyKind: UncommittedChangesStrategyKind
  readonly availableEditors: ReadonlyArray<ExternalEditor>
  readonly selectedExternalEditor: ExternalEditor | null
  readonly availableShells: ReadonlyArray<Shell>
  readonly selectedShell: Shell
  readonly mergeTool: IMergeTool | null
}

/** The app-level preferences component. */
export class Preferences extends React.Component<
  IPreferencesProps,
  IPreferencesState
> {
  public constructor(props: IPreferencesProps) {
    super(props)

    this.state = {
      selectedIndex: this.props.initialSelectedTab || PreferencesTab.Accounts,
      committerName: '',
      committerEmail: '',
      disallowedCharactersMessage: null,
      availableEditors: [],
      optOutOfUsageTracking: false,
      confirmRepositoryRemoval: false,
      confirmDiscardChanges: false,
      confirmForcePush: false,
      uncommittedChangesStrategyKind: uncommittedChangesStrategyKindDefault,
      automaticallySwitchTheme: false,
      selectedExternalEditor: this.props.selectedExternalEditor,
      availableShells: [],
      selectedShell: this.props.selectedShell,
      mergeTool: null,
    }
  }

  public async componentWillMount() {
    let committerName = await getGlobalConfigValue('user.name')
    let committerEmail = await getGlobalConfigValue('user.email')

    if (!committerName || !committerEmail) {
      const account = this.props.dotComAccount || this.props.enterpriseAccount

      if (account) {
        if (!committerName) {
          committerName = account.login
        }

        if (!committerEmail) {
          const found = lookupPreferredEmail(account)
          if (found) {
            committerEmail = found.email
          }
        }
      }
    }

    committerName = committerName || ''
    committerEmail = committerEmail || ''

    const [editors, shells, mergeTool] = await Promise.all([
      getAvailableEditors(),
      getAvailableShells(),
      getMergeTool(),
    ])

    const availableEditors = editors.map(e => e.editor)
    const availableShells = shells.map(e => e.shell)

    this.setState({
      committerName,
      committerEmail,
      optOutOfUsageTracking: this.props.optOutOfUsageTracking,
      confirmRepositoryRemoval: this.props.confirmRepositoryRemoval,
      confirmDiscardChanges: this.props.confirmDiscardChanges,
      confirmForcePush: this.props.confirmForcePush,
      uncommittedChangesStrategyKind: this.props.uncommittedChangesStrategyKind,
      availableShells,
      availableEditors,
      mergeTool,
    })
  }

  public render() {
    return (
      <Dialog
        id="preferences"
        title={__DARWIN__ ? '首選項' : '選項'}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSave}
      >
        <div className="preferences-container">
          {this.renderDisallowedCharactersError()}
          <TabBar
            onTabClicked={this.onTabClicked}
            selectedIndex={this.state.selectedIndex}
            type={TabBarType.Vertical}
          >
            <span>
              <Octicon className="icon" symbol={OcticonSymbol.home} />
              帳戶
            </span>
            <span>
              <Octicon className="icon" symbol={OcticonSymbol.person} />
              綜合
            </span>
            <span>
              <Octicon className="icon" symbol={OcticonSymbol.gitCommit} />
              Git
            </span>
            <span>
              <Octicon className="icon" symbol={OcticonSymbol.paintcan} />
              外觀
            </span>
            <span>
              <Octicon className="icon" symbol={OcticonSymbol.settings} />
              進階
            </span>
          </TabBar>

          {this.renderActiveTab()}
        </div>
        {this.renderFooter()}
      </Dialog>
    )
  }

  private onDotComSignIn = () => {
    this.props.onDismissed()
    this.props.dispatcher.showDotComSignInDialog()
  }

  private onEnterpriseSignIn = () => {
    this.props.onDismissed()
    this.props.dispatcher.showEnterpriseSignInDialog()
  }

  private onLogout = (account: Account) => {
    this.props.dispatcher.removeAccount(account)
  }

  private renderDisallowedCharactersError() {
    const message = this.state.disallowedCharactersMessage
    if (message != null) {
      return <DialogError>{message}</DialogError>
    } else {
      return null
    }
  }

  private renderActiveTab() {
    const index = this.state.selectedIndex
    let View
    switch (index) {
      case PreferencesTab.Accounts:
        View = (
          <Accounts
            dotComAccount={this.props.dotComAccount}
            enterpriseAccount={this.props.enterpriseAccount}
            onDotComSignIn={this.onDotComSignIn}
            onEnterpriseSignIn={this.onEnterpriseSignIn}
            onLogout={this.onLogout}
          />
        )
        break
      case PreferencesTab.Integrations: {
        View = (
          <Integrations
            availableEditors={this.state.availableEditors}
            selectedExternalEditor={this.state.selectedExternalEditor}
            onSelectedEditorChanged={this.onSelectedEditorChanged}
            availableShells={this.state.availableShells}
            selectedShell={this.state.selectedShell}
            onSelectedShellChanged={this.onSelectedShellChanged}
            mergeTool={this.state.mergeTool}
            onMergeToolCommandChanged={this.onMergeToolCommandChanged}
            onMergeToolNameChanged={this.onMergeToolNameChanged}
          />
        )
        break
      }
      case PreferencesTab.Git: {
        View = (
          <Git
            name={this.state.committerName}
            email={this.state.committerEmail}
            onNameChanged={this.onCommitterNameChanged}
            onEmailChanged={this.onCommitterEmailChanged}
          />
        )
        break
      }
      case PreferencesTab.Appearance:
        View = (
          <Appearance
            selectedTheme={this.props.selectedTheme}
            onSelectedThemeChanged={this.onSelectedThemeChanged}
            automaticallySwitchTheme={this.props.automaticallySwitchTheme}
            onAutomaticallySwitchThemeChanged={
              this.onAutomaticallySwitchThemeChanged
            }
          />
        )
        break
      case PreferencesTab.Advanced: {
        View = (
          <Advanced
            optOutOfUsageTracking={this.state.optOutOfUsageTracking}
            confirmRepositoryRemoval={this.state.confirmRepositoryRemoval}
            confirmDiscardChanges={this.state.confirmDiscardChanges}
            confirmForcePush={this.state.confirmForcePush}
            uncommittedChangesStrategyKind={
              this.state.uncommittedChangesStrategyKind
            }
            onOptOutofReportingchanged={this.onOptOutofReportingChanged}
            onConfirmRepositoryRemovalChanged={
              this.onConfirmRepositoryRemovalChanged
            }
            onConfirmDiscardChangesChanged={this.onConfirmDiscardChangesChanged}
            onConfirmForcePushChanged={this.onConfirmForcePushChanged}
            onUncommittedChangesStrategyKindChanged={
              this.onUncommittedChangesStrategyKindChanged
            }
          />
        )
        break
      }
      default:
        return assertNever(index, `未知的標籤索引: ${index}`)
    }

    return <div className="tab-container">{View}</div>
  }

  private onOptOutofReportingChanged = (value: boolean) => {
    this.setState({ optOutOfUsageTracking: value })
  }

  private onConfirmRepositoryRemovalChanged = (value: boolean) => {
    this.setState({ confirmRepositoryRemoval: value })
  }

  private onConfirmDiscardChangesChanged = (value: boolean) => {
    this.setState({ confirmDiscardChanges: value })
  }

  private onConfirmForcePushChanged = (value: boolean) => {
    this.setState({ confirmForcePush: value })
  }

  private onUncommittedChangesStrategyKindChanged = (
    value: UncommittedChangesStrategyKind
  ) => {
    this.setState({ uncommittedChangesStrategyKind: value })
  }

  private onCommitterNameChanged = (committerName: string) => {
    this.setState({
      committerName,
      disallowedCharactersMessage: gitAuthorNameIsValid(committerName)
        ? null
        : '名稱無效，包含不允許的字元。',
    })
  }

  private onCommitterEmailChanged = (committerEmail: string) => {
    this.setState({ committerEmail })
  }

  private onSelectedEditorChanged = (editor: ExternalEditor) => {
    this.setState({ selectedExternalEditor: editor })
  }

  private onSelectedShellChanged = (shell: Shell) => {
    this.setState({ selectedShell: shell })
  }

  private onSelectedThemeChanged = (theme: ApplicationTheme) => {
    this.props.dispatcher.setSelectedTheme(theme)
  }

  private onAutomaticallySwitchThemeChanged = (
    automaticallySwitchTheme: boolean
  ) => {
    this.props.dispatcher.onAutomaticallySwitchThemeChanged(
      automaticallySwitchTheme
    )
  }

  private renderFooter() {
    const hasDisabledError = this.state.disallowedCharactersMessage != null

    const index = this.state.selectedIndex
    switch (index) {
      case PreferencesTab.Accounts:
      case PreferencesTab.Appearance:
        return null
      case PreferencesTab.Integrations:
      case PreferencesTab.Advanced:
      case PreferencesTab.Git: {
        return (
          <DialogFooter>
            <OkCancelButtonGroup
              okButtonText="儲存"
              okButtonDisabled={hasDisabledError}
            />
          </DialogFooter>
        )
      }
      default:
        return assertNever(index, `未知的標籤索引: ${index}`)
    }
  }

  private onSave = async () => {
    await setGlobalConfigValue('user.name', this.state.committerName)
    await setGlobalConfigValue('user.email', this.state.committerEmail)
    await this.props.dispatcher.setStatsOptOut(
      this.state.optOutOfUsageTracking,
      false
    )
    await this.props.dispatcher.setConfirmRepoRemovalSetting(
      this.state.confirmRepositoryRemoval
    )

    await this.props.dispatcher.setConfirmForcePushSetting(
      this.state.confirmForcePush
    )

    if (this.state.selectedExternalEditor) {
      await this.props.dispatcher.setExternalEditor(
        this.state.selectedExternalEditor
      )
    }
    await this.props.dispatcher.setShell(this.state.selectedShell)
    await this.props.dispatcher.setConfirmDiscardChangesSetting(
      this.state.confirmDiscardChanges
    )

    await this.props.dispatcher.setUncommittedChangesStrategyKindSetting(
      this.state.uncommittedChangesStrategyKind
    )

    const mergeTool = this.state.mergeTool
    if (mergeTool && mergeTool.name) {
      await setGlobalConfigValue('merge.tool', mergeTool.name)

      if (mergeTool.command) {
        await setGlobalConfigValue(
          `mergetool.${mergeTool.name}.cmd`,
          mergeTool.command
        )
      }
    }

    this.props.onDismissed()
  }

  private onTabClicked = (index: number) => {
    this.setState({ selectedIndex: index })
  }

  private onMergeToolNameChanged = (name: string) => {
    const mergeTool = {
      name,
      command: this.state.mergeTool && this.state.mergeTool.command,
    }
    this.setState({ mergeTool })
  }

  private onMergeToolCommandChanged = (command: string) => {
    const mergeTool = {
      name: this.state.mergeTool ? this.state.mergeTool.name : '',
      command,
    }
    this.setState({ mergeTool })
  }
}
