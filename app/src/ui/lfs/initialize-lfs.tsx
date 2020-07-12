import * as React from 'react'
import { Repository } from '../../models/repository'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { PathText } from '../lib/path-text'
import { LinkButton } from '../lib/link-button'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

const LFSURL = 'https://git-lfs.github.com/'

/**
 * If we're initializing any more than this number, we won't bother listing them
 * all.
 */
const MaxRepositoriesToList = 10

interface IInitializeLFSProps {
  /** The repositories in which LFS needs to be initialized. */
  readonly repositories: ReadonlyArray<Repository>

  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * Called when the user chooses to initialize LFS in the repositories.
   */
  readonly onInitialize: (repositories: ReadonlyArray<Repository>) => void
}

export class InitializeLFS extends React.Component<IInitializeLFSProps, {}> {
  public render() {
    return (
      <Dialog
        id="initialize-lfs"
        title="初始化 Git LFS"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onInitialize}
      >
        <DialogContent>{this.renderRepositories()}</DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="初始化 Git LFS"
            cancelButtonText={__DARWIN__ ? 'Not Now' : '現在不要'}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onInitialize = () => {
    this.props.onInitialize(this.props.repositories)
  }

  private renderRepositories() {
    if (this.props.repositories.length > MaxRepositoriesToList) {
      return (
        <p>
          {this.props.repositories.length} 存儲庫使用{' '}
          <LinkButton uri={LFSURL}>Git LFS</LinkButton>。 為他們做貢獻，首先必須初始化 Git LFS。 你想現在這樣做嗎?
        </p>
      )
    } else {
      const plural = this.props.repositories.length !== 1
      const pluralizedRepositories = plural
        ? 'The repositories use'
        : '此存儲庫使用'
      const pluralizedUse = plural ? 'them' : 'it'
      return (
        <div>
          <p>
            {pluralizedRepositories}{' '}
            <LinkButton uri={LFSURL}>Git LFS</LinkButton>. 貢獻給{' '}
            {pluralizedUse}，首先必須初始化 Git LFS。 你想現在這樣做嗎?
          </p>
          <ul>
            {this.props.repositories.map(r => (
              <li key={r.id}>
                <PathText path={r.path} />
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }
}
