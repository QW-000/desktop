import * as React from 'react'
import { WelcomeStep } from './welcome'
import { LinkButton } from '../lib/link-button'

/**
 * The URL to the sign-up page on GitHub.com. Used in conjunction
 * with account actions in the app where the user might want to
 * consider signing up.
 */
export const CreateAccountURL = 'https://github.com/join?source=github-desktop'

interface IStartProps {
  readonly advance: (step: WelcomeStep) => void
}

/** The first step of the Welcome flow. */
export class Start extends React.Component<IStartProps, {}> {
  public render() {
    return (
      <div id="start">
        <h1 className="welcome-title">歡迎使用 GitHub&nbsp;Desktop</h1>
        <p className="welcome-text">
          GitHub Desktop 是一種在 GitHub 上為項目做貢獻的無縫方式
             與 GitHub Enterprise。 在下方登入可以開始使用您的項目。
        </p>

        <p className="welcome-text">
          新的 GitHub?{' '}
          <LinkButton uri={CreateAccountURL}>
            建立免費帳戶。
          </LinkButton>
        </p>

        <hr className="short-rule" />

        <div>
          <LinkButton className="welcome-button" onClick={this.signInToDotCom}>
            登入 GitHub.com
          </LinkButton>
        </div>

        <div>
          <LinkButton
            className="welcome-button"
            onClick={this.signInToEnterprise}
          >
            登入 GitHub Enterprise
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
