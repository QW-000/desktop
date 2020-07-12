import * as React from 'react'
import { Account } from '../../models/account'
import { IAvatarUser } from '../../models/avatar'
import { lookupPreferredEmail } from '../../lib/email'
import { assertNever } from '../../lib/fatal-error'
import { Button } from '../lib/button'
import { Row } from '../lib/row'
import { DialogContent } from '../dialog'
import { Avatar } from '../lib/avatar'
import { CallToAction } from '../lib/call-to-action'

interface IAccountsProps {
  readonly dotComAccount: Account | null
  readonly enterpriseAccount: Account | null

  readonly onDotComSignIn: () => void
  readonly onEnterpriseSignIn: () => void
  readonly onLogout: (account: Account) => void
}

enum SignInType {
  DotCom,
  Enterprise,
}

export class Accounts extends React.Component<IAccountsProps, {}> {
  public render() {
    return (
      <DialogContent className="accounts-tab">
        <h2>GitHub.com</h2>
        {this.props.dotComAccount
          ? this.renderAccount(this.props.dotComAccount)
          : this.renderSignIn(SignInType.DotCom)}

        <h2>GitHub Enterprise Server</h2>
        {this.props.enterpriseAccount
          ? this.renderAccount(this.props.enterpriseAccount)
          : this.renderSignIn(SignInType.Enterprise)}
      </DialogContent>
    )
  }

  private renderAccount(account: Account) {
    const avatarUser: IAvatarUser = {
      name: account.name,
      email: lookupPreferredEmail(account),
      avatarURL: account.avatarURL,
      endpoint: account.endpoint,
    }

    return (
      <Row className="account-info">
        <Avatar user={avatarUser} />
        <div className="user-info">
          <div className="name">{account.name}</div>
          <div className="login">@{account.login}</div>
        </div>
        <Button onClick={this.logout(account)}>
          {__DARWIN__ ? 'Sign Out' : '登出'}
        </Button>
      </Row>
    )
  }

  private onDotComSignIn = () => {
    this.props.onDotComSignIn()
  }

  private onEnterpriseSignIn = () => {
    this.props.onEnterpriseSignIn()
  }

  private renderSignIn(type: SignInType) {
    const signInTitle = __DARWIN__ ? 'Sign In' : '登入'
    switch (type) {
      case SignInType.DotCom: {
        return (
          <CallToAction
            actionTitle={signInTitle}
            onAction={this.onDotComSignIn}
          >
            <div>
              登入 GitHub.com 帳戶存取您的存儲庫。
            </div>
          </CallToAction>
        )
      }
      case SignInType.Enterprise:
        return (
          <CallToAction
            actionTitle={signInTitle}
            onAction={this.onEnterpriseSignIn}
          >
            <div>
              如果您有 GitHub Enterprise 伺服器帳戶，請登入此帳戶存取存儲庫。
            </div>
          </CallToAction>
        )
      default:
        return assertNever(type, `未知的登入類型: ${type}`)
    }
  }

  private logout = (account: Account) => {
    return () => {
      this.props.onLogout(account)
    }
  }
}
