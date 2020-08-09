import * as React from 'react'

import { TextBox } from '../lib/text-box'
import { Row } from '../lib/row'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { RetryAction } from '../../models/retry-actions'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Ref } from '../lib/ref'

interface IGenericGitAuthenticationProps {
  /** The hostname with which the user tried to authenticate. */
  readonly hostname: string

  /** The function to call when the user saves their credentials. */
  readonly onSave: (
    hostname: string,
    username: string,
    password: string,
    retryAction: RetryAction
  ) => void

  /** The function to call when the user dismisses the dialog. */
  readonly onDismiss: () => void

  /** The action to retry after getting credentials. */
  readonly retryAction: RetryAction
}

interface IGenericGitAuthenticationState {
  readonly username: string
  readonly password: string
}

/** Shown to enter the credentials to authenticate to a generic git server. */
export class GenericGitAuthentication extends React.Component<
  IGenericGitAuthenticationProps,
  IGenericGitAuthenticationState
> {
  public constructor(props: IGenericGitAuthenticationProps) {
    super(props)

    this.state = { username: '', password: '' }
  }

  public render() {
    const disabled = !this.state.password.length || !this.state.username.length
    return (
      <Dialog
        id="generic-git-auth"
        title={__DARWIN__ ? `Authentication Failed` : `驗證失敗`}
        onDismissed={this.props.onDismiss}
        onSubmit={this.save}
      >
        <DialogContent>
          <p>
            無法以 <Ref>{this.props.hostname}</Ref>
            進行身份驗證。 請輸入您的用戶名和密碼再試一次。
          </p>

          <Row>
            <TextBox
              label="用戶名"
              autoFocus={true}
              value={this.state.username}
              onValueChanged={this.onUsernameChange}
            />
          </Row>

          <Row>
            <TextBox
              label="密碼"
              type="password"
              value={this.state.password}
              onValueChanged={this.onPasswordChange}
            />
          </Row>
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={__DARWIN__ ? 'Save and Retry' : '儲存並重試'}
            okButtonDisabled={disabled}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onUsernameChange = (value: string) => {
    this.setState({ username: value })
  }

  private onPasswordChange = (value: string) => {
    this.setState({ password: value })
  }

  private save = () => {
    this.props.onDismiss()

    this.props.onSave(
      this.props.hostname,
      this.state.username,
      this.state.password,
      this.props.retryAction
    )
  }
}
