import * as React from 'react'

import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'

import { DialogFooter, DialogContent, Dialog } from '../dialog'

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
          <ButtonGroup>
            <Button type="submit">離開教學</Button>
            <Button onClick={this.props.onDismissed}>取消</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}
