import * as React from 'react'
import { DialogContent } from '../dialog'
import { LinkButton } from '../lib/link-button'
import { CallToAction } from '../lib/call-to-action'

const HelpURL = 'https://help.github.com/articles/about-remote-repositories/'

interface INoRemoteProps {
  /** The function to call when the users chooses to publish. */
  readonly onPublish: () => void
}

/** The component for when a repository has no remote. */
export class NoRemote extends React.Component<INoRemoteProps, {}> {
  public render() {
    return (
      <DialogContent>
        <CallToAction actionTitle="Publish" onAction={this.props.onPublish}>
          <div>
            將您的存儲庫發佈到 GitHub。 需要幫助?{' '}
            <LinkButton uri={HelpURL}>學到更多</LinkButton> 關於遠端存儲庫。
          </div>
        </CallToAction>
      </DialogContent>
    )
  }
}
