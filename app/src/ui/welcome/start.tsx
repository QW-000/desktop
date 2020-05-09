import * as React from 'react'
import { WelcomeStep } from './welcome'
import { LinkButton } from '../lib/link-button'
import { Dispatcher } from '../dispatcher'
import { Octicon, OcticonSymbol } from '../octicons'
import { Button } from '../lib/button'
import { Loading } from '../lib/loading'

/**
 * The URL to the sign-up page on GitHub.com. Used in conjunction
 * with account actions in the app where the user might want to
 * consider signing up.
 */
export const CreateAccountURL = 'https://github.com/join?source=github-desktop'

interface IStartProps {
  readonly advance: (step: WelcomeStep) => void
  readonly dispatcher: Dispatcher
  readonly loadingBrowserAuth: boolean
}

/** The first step of the Welcome flow. */
export class Start extends React.Component<IStartProps, {}> {
  public render() {
    return (
      <div id="start">
        <h1 className="welcome-title">歡迎使用 GitHub&nbsp;Desktop</h1>
        <p className="welcome-text">
          GitHub Desktop 是一種在 GitHub 上為項目做貢獻的無縫方式
             與 GitHub Enterprise 伺服器。 在下方登入可以開始使用您的項目。
        </p>

        <p className="welcome-text">
          新的 GitHub?{' '}
          <LinkButton uri={CreateAccountURL} className="create-account-link">
            建立免費帳戶。
          </LinkButton>
        </p>

        <div className="welcome-main-buttons">
          <Button
            type="submit"
            className="button-with-icon"
            disabled={this.props.loadingBrowserAuth}
            onClick={this.signInWithBrowser}
          >
            {this.props.loadingBrowserAuth && <Loading />}
            登入 GitHub.com
            <Octicon symbol={OcticonSymbol.linkExternal} />
          </Button>
          {this.props.loadingBrowserAuth ? (
            <Button onClick={this.cancelBrowserAuth}>取消</Button>
          ) : (
            <Button onClick={this.signInToEnterprise}>
              登入 GitHub Enterprise 伺服器
            </Button>
          )}
        </div>

        <div>
          <LinkButton onClick={this.signInToDotCom} className="basic-auth-link">
            使用您的用戶名和密碼登入 GitHub.com
          </LinkButton>
        </div>

        <div className="skip-action-container">
          <LinkButton className="skip-button" onClick={this.skip}>
            略過此步驟
          </LinkButton>
        </div>
      </div>
    )
  }

  private signInWithBrowser = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
    }

    this.props.advance(WelcomeStep.SignInToDotComWithBrowser)
    this.props.dispatcher.requestBrowserAuthenticationToDotcom()
  }

  private cancelBrowserAuth = () => {
    this.props.advance(WelcomeStep.Start)
  }

  private signInToDotCom = () => {
    this.props.advance(WelcomeStep.SignInToDotCom)
  }

  private signInToEnterprise = () => {
    this.props.advance(WelcomeStep.SignInToEnterprise)
  }

  private skip = () => {
    this.props.advance(WelcomeStep.ConfigureGit)
  }
}
