import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import {
  SignInState,
  SignInStep,
  IEndpointEntryState,
  IAuthenticationState,
  ITwoFactorAuthenticationState,
} from '../../lib/stores'
import { assertNever } from '../../lib/fatal-error'
import { LinkButton } from '../lib/link-button'
import { Octicon, OcticonSymbol } from '../octicons'
import { Row } from '../lib/row'
import { TextBox } from '../lib/text-box'
import { Dialog, DialogError, DialogContent, DialogFooter } from '../dialog'

import { getWelcomeMessage } from '../../lib/2fa'
import { getDotComAPIEndpoint } from '../../lib/api'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Button } from '../lib/button'

interface ISignInProps {
  readonly dispatcher: Dispatcher
  readonly signInState: SignInState | null
  readonly onDismissed: () => void
}

interface ISignInState {
  readonly endpoint: string
  readonly username: string
  readonly password: string
  readonly otpToken: string
}

const SignInWithBrowserTitle = __DARWIN__
  ? 'Sign in Using Your Browser'
  : '使用瀏覽器登入'

const DefaultTitle = '登入'

export class SignIn extends React.Component<ISignInProps, ISignInState> {
  public constructor(props: ISignInProps) {
    super(props)

    this.state = {
      endpoint: '',
      username: '',
      password: '',
      otpToken: '',
    }
  }

  public componentWillReceiveProps(nextProps: ISignInProps) {
    if (nextProps.signInState !== this.props.signInState) {
      if (
        nextProps.signInState &&
        nextProps.signInState.kind === SignInStep.Success
      ) {
        this.props.onDismissed()
      }
    }
  }

  private onSubmit = () => {
    const state = this.props.signInState

    if (!state) {
      return
    }

    const stepKind = state.kind

    switch (state.kind) {
      case SignInStep.EndpointEntry:
        this.props.dispatcher.setSignInEndpoint(this.state.endpoint)
        break
      case SignInStep.Authentication:
        if (!state.supportsBasicAuth) {
          this.props.dispatcher.requestBrowserAuthentication()
        } else {
          this.props.dispatcher.setSignInCredentials(
            this.state.username,
            this.state.password
          )
        }
        break
      case SignInStep.TwoFactorAuthentication:
        this.props.dispatcher.setSignInOTP(this.state.otpToken)
        break
      case SignInStep.Success:
        this.props.onDismissed()
        break
      default:
        assertNever(state, `未知的登入步驟 ${stepKind}`)
    }
  }

  private onEndpointChanged = (endpoint: string) => {
    this.setState({ endpoint })
  }

  private onUsernameChanged = (username: string) => {
    this.setState({ username })
  }

  private onPasswordChanged = (password: string) => {
    this.setState({ password })
  }

  private onOTPTokenChanged = (otpToken: string) => {
    this.setState({ otpToken })
  }

  private onSignInWithBrowser = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    this.props.dispatcher.requestBrowserAuthentication()
  }

  private renderFooter(): JSX.Element | null {
    const state = this.props.signInState

    if (!state || state.kind === SignInStep.Success) {
      return null
    }

    let disableSubmit = false

    let primaryButtonText: string
    const stepKind = state.kind

    switch (state.kind) {
      case SignInStep.EndpointEntry:
        disableSubmit = this.state.endpoint.length === 0
        primaryButtonText = '繼續'
        break
      case SignInStep.TwoFactorAuthentication:
        // ensure user has entered non-whitespace characters
        const codeProvided = /\S+/.test(this.state.otpToken)
        disableSubmit = !codeProvided
        primaryButtonText = '登入'
        break
      case SignInStep.Authentication:
        if (!state.supportsBasicAuth) {
          primaryButtonText = __DARWIN__
            ? 'Continue With Browser'
            : '用瀏覽器繼續'
        } else {
          const validUserName = this.state.username.length > 0
          const validPassword = this.state.password.length > 0
          disableSubmit = !validUserName || !validPassword
          primaryButtonText = '登入'
        }
        break
      default:
        return assertNever(state, `未知的登入步驟 ${stepKind}`)
    }

    return (
      <DialogFooter>
        <OkCancelButtonGroup
          okButtonText={primaryButtonText}
          okButtonDisabled={disableSubmit}
        />
      </DialogFooter>
    )
  }

  private renderEndpointEntryStep(state: IEndpointEntryState) {
    return (
      <DialogContent>
        <Row>
          <TextBox
            label="Enterprise 伺服器地址"
            value={this.state.endpoint}
            onValueChanged={this.onEndpointChanged}
            placeholder="https://github.example.com"
          />
        </Row>
      </DialogContent>
    )
  }

  private renderAuthenticationStep(state: IAuthenticationState) {
    if (!state.supportsBasicAuth) {
      if (state.endpoint === getDotComAPIEndpoint()) {
        return (
          <DialogContent>
            <p>
              為了提高您的帳戶安全，GitHub 現在需要您經由瀏覽器登入。
            </p>
            <p>
              登入後，瀏覽器將會返回 GitHub Desktop。如果瀏覽器要求您啟動 GitHub Desktop 的許可，請允許它。
            </p>
          </DialogContent>
        )
      } else {
        return (
          <DialogContent>
            <p>
              您的 GitHub Enterprise 伺服器情況需要您使用瀏覽器登入。
            </p>
          </DialogContent>
        )
      }
    }

    const disableSubmit = state.loading

    return (
      <DialogContent>
        <Row className="sign-in-with-browser">
          <Button
            className="button-with-icon"
            type="submit"
            onClick={this.onSignInWithBrowser}
            disabled={disableSubmit}
          >
            使用您的瀏覽器登入
            <Octicon symbol={OcticonSymbol.linkExternal} />
          </Button>
        </Row>

        <div className="horizontal-rule">
          <span className="horizontal-rule-content">or</span>
        </div>

        <Row>
          <TextBox
            label="用戶名稱或電子郵件地址"
            value={this.state.username}
            onValueChanged={this.onUsernameChanged}
          />
        </Row>
        <Row>
          <TextBox
            label="密碼"
            value={this.state.password}
            type="password"
            onValueChanged={this.onPasswordChanged}
          />
        </Row>
        <Row>
          <LinkButton
            className="forgot-password-link-sign-in"
            uri={state.forgotPasswordUrl}
          >
            忘記密碼?
          </LinkButton>
        </Row>
      </DialogContent>
    )
  }

  private renderTwoFactorAuthenticationStep(
    state: ITwoFactorAuthenticationState
  ) {
    return (
      <DialogContent>
        <p>{getWelcomeMessage(state.type)}</p>
        <Row>
          <TextBox
            label="驗證碼"
            value={this.state.otpToken}
            onValueChanged={this.onOTPTokenChanged}
            labelLinkText={`這是什麼?`}
            labelLinkUri="https://help.github.com/articles/providing-your-2fa-authentication-code/"
            autoFocus={true}
          />
        </Row>
      </DialogContent>
    )
  }

  private renderStep(): JSX.Element | null {
    const state = this.props.signInState

    if (!state) {
      return null
    }

    const stepKind = state.kind

    switch (state.kind) {
      case SignInStep.EndpointEntry:
        return this.renderEndpointEntryStep(state)
      case SignInStep.Authentication:
        return this.renderAuthenticationStep(state)
      case SignInStep.TwoFactorAuthentication:
        return this.renderTwoFactorAuthenticationStep(state)
      case SignInStep.Success:
        return null
      default:
        return assertNever(state, `未知的登入步驟 ${stepKind}`)
    }
  }

  public render() {
    const state = this.props.signInState

    if (!state || state.kind === SignInStep.Success) {
      return null
    }

    const disabled = state.loading

    const errors = state.error ? (
      <DialogError>{state.error.message}</DialogError>
    ) : null

    const title =
      this.props.signInState &&
      this.props.signInState.kind === SignInStep.Authentication &&
      !this.props.signInState.supportsBasicAuth
        ? SignInWithBrowserTitle
        : DefaultTitle

    return (
      <Dialog
        id="登入"
        title={title}
        disabled={disabled}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
        loading={state.loading}
      >
        {errors}
        {this.renderStep()}
        {this.renderFooter()}
      </Dialog>
    )
  }
}
