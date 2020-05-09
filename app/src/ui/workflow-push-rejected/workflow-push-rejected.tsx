import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Dispatcher } from '../dispatcher'
import { Ref } from '../lib/ref'
import { Repository } from '../../models/repository'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

const okButtonText = __DARWIN__ ? 'Continue in Browser' : '在瀏覽器繼續'

interface IWorkflowPushRejectedDialogProps {
  readonly rejectedPath: string
  readonly repository: Repository
  readonly dispatcher: Dispatcher

  readonly onDismissed: () => void
}
interface IWorkflowPushRejectedDialogState {
  readonly loading: boolean
}
/**
 * The dialog shown when a push is rejected due to it modifying a
 * workflow file without the workflow oauth scope.
 */
export class WorkflowPushRejectedDialog extends React.Component<
  IWorkflowPushRejectedDialogProps,
  IWorkflowPushRejectedDialogState
> {
  public constructor(props: IWorkflowPushRejectedDialogProps) {
    super(props)
    this.state = { loading: false }
  }

  public render() {
    return (
      <Dialog
        id="workflow-push-rejected"
        title={__DARWIN__ ? '推送遭拒' : '推送遭拒'}
        loading={this.state.loading}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSignIn}
        type="error"
      >
        <DialogContent>
          <p>
            伺服器拒絕此推送，因為此推送包含對工作流程檔案 <Ref>{this.props.rejectedPath}</Ref> 的修改。
            為了能夠推送到工作流程檔案，GitHub Desktop 需要請求其它權限。
          </p>
          <p>
            是否要開啟瀏覽器以授予 GitHub Desktop 更新工作流程檔案的權限?
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

    await this.props.dispatcher.requestBrowserAuthenticationToDotcom()

    this.props.dispatcher.push(this.props.repository)
    this.props.onDismissed()
  }
}
