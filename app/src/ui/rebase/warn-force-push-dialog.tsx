import * as React from 'react'

import { Repository } from '../../models/repository'
import { WarnForcePushStep } from '../../models/rebase-flow-step'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { Dispatcher } from '../dispatcher'
import { DialogFooter, DialogContent, Dialog } from '../dialog'
import { Ref } from '../lib/ref'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IWarnForcePushProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly step: WarnForcePushStep
  readonly askForConfirmationOnForcePush: boolean
  readonly onDismissed: () => void
}

interface IWarnForcePushState {
  readonly askForConfirmationOnForcePush: boolean
}

export class WarnForcePushDialog extends React.Component<
  IWarnForcePushProps,
  IWarnForcePushState
> {
  public constructor(props: IWarnForcePushProps) {
    super(props)

    this.state = {
      askForConfirmationOnForcePush: props.askForConfirmationOnForcePush,
    }
  }

  public render() {
    const { baseBranch, targetBranch } = this.props.step

    const title = __DARWIN__
      ? 'Rebase Will Require Force Push'
      : '變基需要強制推送'

    return (
      <Dialog
        title={title}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onBeginRebase}
        dismissable={false}
        type="warning"
      >
        <DialogContent>
          <p>
            您確定要變基 <Ref>{targetBranch.name}</Ref> 到 {' '}
            <Ref>{baseBranch.name}</Ref>?
          </p>
          <p>
            在變基流程結束時，GitHub Desktop 將使您能夠強制推送分支以更新上游分支。
            強制推送將變更遠端伺服器上的歷程記錄，並可能對該分支上的其他合作者造成問題。
          </p>
          <div>
            <Checkbox
              label="不要再顯示此訊息"
              value={
                this.state.askForConfirmationOnForcePush
                  ? CheckboxValue.Off
                  : CheckboxValue.On
              }
              onChange={this.onAskForConfirmationOnForcePushChanged}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={__DARWIN__ ? 'Begin Rebase' : '開始變基'}
            onCancelButtonClick={this.props.onDismissed}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onAskForConfirmationOnForcePushChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = !event.currentTarget.checked

    this.setState({ askForConfirmationOnForcePush: value })
  }

  private onBeginRebase = async () => {
    this.props.dispatcher.setConfirmForcePushSetting(
      this.state.askForConfirmationOnForcePush
    )

    const { baseBranch, targetBranch, commits } = this.props.step

    await this.props.dispatcher.startRebase(
      this.props.repository,
      baseBranch,
      targetBranch,
      commits,
      { continueWithForcePush: true }
    )
  }
}
