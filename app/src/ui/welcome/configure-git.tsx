import * as React from 'react'
import { WelcomeStep } from './welcome'
import { Account } from '../../models/account'
import { ConfigureGitUser } from '../lib/configure-git-user'
import { Button } from '../lib/button'

interface IConfigureGitProps {
  readonly accounts: ReadonlyArray<Account>
  readonly advance: (step: WelcomeStep) => void
}

/** The Welcome flow step to configure git. */
export class ConfigureGit extends React.Component<IConfigureGitProps, {}> {
  public render() {
    return (
      <div id="configure-git">
        <h1 className="welcome-title">設定 Git</h1>
        <p className="welcome-text">
          這用於識別您建立的提交(包含任何人)。
          如果您發布提交可以觀看此訊息。
        </p>

        <ConfigureGitUser
          accounts={this.props.accounts}
          onSave={this.continue}
          saveLabel="繼續"
        >
          <Button onClick={this.cancel}>取消</Button>
        </ConfigureGitUser>
      </div>
    )
  }

  private cancel = () => {
    this.props.advance(WelcomeStep.Start)
  }

  private continue = () => {
    this.props.advance(WelcomeStep.UsageOptOut)
  }
}
