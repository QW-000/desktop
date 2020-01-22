import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Dispatcher } from '../dispatcher'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { getDotComAPIEndpoint } from '../../lib/api'
import { RetryAction } from '../../models/retry-actions'

const okButtonText = __DARWIN__ ? 'Continue in Browser' : '在瀏覽器繼續'

interface ISAMLReauthRequiredDialogProps {
  readonly dispatcher: Dispatcher
  readonly organizationName: string
  readonly endpoint: string

  /** The action to retry if applicable. */
  readonly retryAction?: RetryAction

  readonly onDismissed: () => void
}
interface ISAMLReauthRequiredDialogState {
  readonly loading: boolean
}
/**
 * The dialog shown when a Git network operation is denied due to
 * the organization owning the repository having enforced SAML
 * SSO and the current session not being authorized.
 */
export class SAMLReauthRequiredDialog extends React.Component<
  ISAMLReauthRequiredDialogProps,
  ISAMLReauthRequiredDialogState
> {
  public constructor(props: ISAMLReauthRequiredDialogProps) {
    super(props)
    this.state = { loading: false }
  }

  public render() {
    return (
      <Dialog
        title={
          __DARWIN__ ? 'Re-authorization Required' : '需要重新授權'
        }
        loading={this.state.loading}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSignIn}
        type="error"
      >
        <DialogContent>
          <p>
            "{this.props.organizationName}" 組織已啟用或強制執行 SAML SSO。
            要存取此存儲庫，您必須再次登入並授予 GitHub Desktop 權限以存取組織的存儲庫。
          </p>
          <p>
            您是否要開啟瀏覽器以授予 GitHub Desktop 存取存儲庫的權限?
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup okButtonText={okButtonText} />
        </DialogFooter>
      </Dialog>
    )
  }

  private onSignIn = async () => {
    this.setState({ loading: true })

    if (this.props.endpoint === getDotComAPIEndpoint()) {
      await this.props.dispatcher.beginDotComSignIn()
    } else {
      await this.props.dispatcher.beginEnterpriseSignIn()
    }
    await this.props.dispatcher.requestBrowserAuthentication()

    if (this.props.retryAction !== undefined) {
      this.props.dispatcher.performRetry(this.props.retryAction)
    }

    this.props.onDismissed()
  }
}
