import * as React from 'react'

import { DialogFooter, DialogContent, Dialog } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IConfirmExitTutorialProps {
  readonly onDismissed: () => void
  readonly onContinue: () => void
}

export class ConfirmExitTutorial extends React.Component<
  IConfirmExitTutorialProps,
  {}
> {
  public render() {
    return (
      <Dialog
        title={__DARWIN__ ? '離開教學' : '離開教學'}
        onDismissed={this.props.onDismissed}
        onSubmit={this.props.onContinue}
        type="normal"
      >
        <DialogContent>
          <p>
            您確定要離開本教學嗎？ 這將帶您返回主畫面。
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={__DARWIN__ ? 'Exit Tutorial' : '離開教學'}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
