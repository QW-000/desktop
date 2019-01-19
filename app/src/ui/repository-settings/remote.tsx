import * as React from 'react'
import { IRemote } from '../../models/remote'
import { TextBox } from '../lib/text-box'
import { DialogContent } from '../dialog'

interface IRemoteProps {
  /** The remote being shown. */
  readonly remote: IRemote

  /** The function to call when the remote URL is changed by the user. */
  readonly onRemoteUrlChanged: (url: string) => void
}

/** The Remote component. */
export class Remote extends React.Component<IRemoteProps, {}> {
  public render() {
    const remote = this.props.remote
    return (
      <DialogContent>
        <div>主遠端存儲庫 ({remote.name})</div>
        <TextBox
          placeholder="遠端網址"
          value={remote.url}
          onValueChanged={this.props.onRemoteUrlChanged}
        />
      </DialogContent>
    )
  }
}
