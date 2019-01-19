import * as React from 'react'
import { Dispatcher } from '../../lib/dispatcher/index'
import { LinkButton } from '../lib/link-button'
import { updateStore } from '../lib/update-store'
import { Octicon, OcticonSymbol } from '../octicons'
import { PopupType } from '../../models/popup'
import { shell } from '../../lib/app-shell'

import { ReleaseSummary } from '../../models/release-notes'
import { Banner } from './banner'

interface IUpdateAvailableProps {
  readonly dispatcher: Dispatcher
  readonly newRelease: ReleaseSummary | null
  readonly onDismissed: () => void
}

/**
 * A component which tells the user an update is available and gives them the
 * option of moving into the future or being a luddite.
 */
export class UpdateAvailable extends React.Component<
  IUpdateAvailableProps,
  {}
> {
  public render() {
    return (
      <Banner id="update-available" onDismissed={this.props.onDismissed}>
        <Octicon
          className="download-icon"
          symbol={OcticonSymbol.desktopDownload}
        />

        <span onSubmit={this.updateNow}>
          GitHub Desktop 有更新版本可用，將在下次發佈時安裝。 見 {' '}
          <LinkButton onClick={this.showReleaseNotes}>什麼是新的</LinkButton> 或 {' '}
          <LinkButton onClick={this.updateNow}>
            重新啟動 GitHub Desktop
          </LinkButton>
          .
        </span>
      </Banner>
    )
  }

  private showReleaseNotes = () => {
    if (this.props.newRelease == null) {
      // if, for some reason we're not able to render the release notes we
      // should redirect the user to the website so we do _something_
      const releaseNotesUri = 'https://desktop.github.com/release-notes/'
      shell.openExternal(releaseNotesUri)
    } else {
      this.props.dispatcher.showPopup({
        type: PopupType.ReleaseNotes,
        newRelease: this.props.newRelease,
      })
    }
  }

  private updateNow = () => {
    updateStore.quitAndInstallUpdate()
  }
}
