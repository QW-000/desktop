import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import { ButtonGroup } from '../lib/button-group'
import { DialogFooter, DialogContent, Dialog } from '../dialog'
import { FetchType } from '../../models/fetch'
import { Button } from '../lib/button'
import { Repository } from '../../models/repository'
import { Loading } from '../lib/loading'

interface IPushNeedsPullWarningProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly onDismissed: () => void
}

interface IPushNeedsPullWarningState {
  readonly isLoading: boolean
}

export class PushNeedsPullWarning extends React.Component<
  IPushNeedsPullWarningProps,
  IPushNeedsPullWarningState
> {
  public constructor(props: IPushNeedsPullWarningProps) {
    super(props)

    this.state = {
      isLoading: false,
    }
  }

  public render() {
    return (
      <Dialog
        title={
          __DARWIN__ ? '新的遠端提交' : '新的遠端提交'
        }
        dismissable={!this.state.isLoading}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onFetch}
        type="warning"
      >
        <DialogContent>
          <p>
            Desktop 無法將提交推送到此分支，因為遠端提交了本機分支上不存在的提交。
            在推送之前提取這些新提交，以便將它們與您的本機提交使相符。
          </p>
        </DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type="submit" disabled={this.state.isLoading}>
              {this.state.isLoading ? <Loading /> : null} 提取
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }

  private onFetch = async () => {
    this.setState({ isLoading: true })
    await this.props.dispatcher.fetch(
      this.props.repository,
      FetchType.UserInitiatedTask
    )
    this.setState({ isLoading: false })
    this.props.onDismissed()
  }
}
