import * as React from 'react'
import { LinkButton } from '../lib/link-button'
import { Octicon, OcticonSymbol } from '../octicons'
import { Loading } from './loading'
import { Form } from './form'
import { Button } from './button'
import { TextBox } from './text-box'
import { Errors } from './errors'

interface IAuthenticationFormProps {
  /** Does the server support basic auth? */
  readonly supportsBasicAuth: boolean

  /**
   * A callback which is invoked once the user has entered a username
   * and password and submitted those either by clicking on the submit
   * button or by submitting the form through other means (ie hitting Enter).
   */
  readonly onSubmit: (username: string, password: string) => void

  /**
   * A callback which is invoked if the user requests OAuth sign in using
   * their system configured browser.
   */
  readonly onBrowserSignInRequested: () => void

  /** An array of additional buttons to render after the "Sign In" button. */
  readonly additionalButtons?: ReadonlyArray<JSX.Element>

  /**
   * An error which, if present, is presented to the
   * user in close proximity to the actions or input fields
   * related to the current step.
   */
  readonly error: Error | null

  /**
   * A value indicating whether or not the sign in store is
   * busy processing a request. While this value is true all
   * form inputs and actions save for a cancel action will
   * be disabled.
   */
  readonly loading: boolean

  readonly forgotPasswordUrl: string
}

interface IAuthenticationFormState {
  readonly username: string
  readonly password: string
}

/** The GitHub authentication component. */
export class AuthenticationForm extends React.Component<
  IAuthenticationFormProps,
  IAuthenticationFormState
> {
  public constructor(props: IAuthenticationFormProps) {
    super(props)

    this.state = { username: '', password: '' }
  }

  public render() {
    return (
      <Form className="sign-in-form" onSubmit={this.signIn}>
        {this.renderUsernamePassword()}

        {this.renderSignInWithBrowser()}
      </Form>
    )
  }

  private renderUsernamePassword() {
    if (!this.props.supportsBasicAuth) {
      return null
    }

    const disabled = this.props.loading
    return (
      <div>
        <TextBox
          label="使用者名稱或電子郵件地址"
          disabled={disabled}
          autoFocus={true}
          onValueChanged={this.onUsernameChange}
        />

        <TextBox
          label="密碼"
          type="password"
          disabled={disabled}
          onValueChanged={this.onPasswordChange}
        />

        {this.renderError()}

        {this.renderActions()}
      </div>
    )
  }

  private renderActions() {
    const signInDisabled = Boolean(
      !this.state.username.length ||
        !this.state.password.length ||
        this.props.loading
    )
    return (
      <div className="actions">
        {this.props.supportsBasicAuth ? (
          <Button type="submit" disabled={signInDisabled}>
            {this.props.loading ? <Loading /> : null} 登入
          </Button>
        ) : null}

        {this.props.additionalButtons}

        {this.props.supportsBasicAuth ? (
          <LinkButton
            className="forgot-password-link"
            uri={this.props.forgotPasswordUrl}
          >
            忘記密碼?
          </LinkButton>
        ) : null}
      </div>
    )
  }

  private renderSignInWithBrowser() {
    const basicAuth = this.props.supportsBasicAuth
    const browserSignInLink = (
      <LinkButton
        className="welcome-link-button link-with-icon"
        onClick={this.signInWithBrowser}
      >
        使用您的瀏覽器登入
        <Octicon symbol={OcticonSymbol.linkExternal} />
      </LinkButton>
    )

    const browserSignInButton = (
      <Button type="submit" onClick={this.signInWithBrowser}>
        使用您的瀏覽器登入
      </Button>
    )

    return (
      <div>
        {basicAuth ? <hr className="short-rule" /> : null}
        {basicAuth ? null : (
          <p>
            您的 GitHub Enterprise 需要使用瀏覽器登入。
          </p>
        )}

        <div className="sign-in-footer">
          {basicAuth ? browserSignInLink : browserSignInButton}
          {basicAuth ? null : this.renderActions()}
        </div>
      </div>
    )
  }

  private renderError() {
    const error = this.props.error
    if (!error) {
      return null
    }

    return <Errors>{error.message}</Errors>
  }

  private onUsernameChange = (username: string) => {
    this.setState({ username })
  }

  private onPasswordChange = (password: string) => {
    this.setState({ password })
  }

  private signInWithBrowser = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
    }
    this.props.onBrowserSignInRequested()
  }

  private signIn = () => {
    this.props.onSubmit(this.state.username, this.state.password)
  }
}
