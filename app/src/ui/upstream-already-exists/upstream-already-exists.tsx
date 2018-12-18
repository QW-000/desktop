import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { ButtonGroup } from '../lib/button-group'
import { Button } from '../lib/button'
import { Repository } from '../../models/repository'
import { IRemote } from '../../models/remote'
import { Ref } from '../lib/ref'
import { forceUnwrap } from '../../lib/fatal-error'
import { UpstreamRemoteName } from '../../lib/stores'

interface IUpstreamAlreadyExistsProps {
  readonly repository: Repository
  readonly existingRemote: IRemote

  readonly onDismissed: () => void

  /** Called when the user chooses to update the existing remote. */
  readonly onUpdate: (repository: Repository) => void

  /** Called when the user chooses to ignore the warning. */
  readonly onIgnore: (repository: Repository) => void
}

/**
 * The dialog shown when a repository is a fork but its upstream remote doesn't
 * point to the parent repository.
 */
export class UpstreamAlreadyExists extends React.Component<
  IUpstreamAlreadyExistsProps
> {
  public render() {
    const name = this.props.repository.name
    const gitHubRepository = forceUnwrap(
      '存儲庫必須具有 GitHub 存儲庫才能增加上游遠端資料庫',
      this.props.repository.gitHubRepository
    )
    const parent = forceUnwrap(
      '存儲庫必須具有父代存儲庫才能增加上游遠端資料庫',
      gitHubRepository.parent
    )
    const parentName = parent.fullName
    const existingURL = this.props.existingRemote.url
    const replacementURL = parent.cloneURL
    return (
      <Dialog
        title={
          __DARWIN__ ? 'Upstream Already Exists' : '上游已經存在'
        }
        onDismissed={this.props.onDismissed}
        onSubmit={this.onIgnore}
        type="warning"
      >
        <DialogContent>
          <p>
            存儲庫 <Ref>{name}</Ref> 是 {' '}
            <Ref>{parentName}</Ref> 的分支，但其 <Ref>{UpstreamRemoteName}</Ref>{' '}
            遠端指向其它位置。
          </p>
          <ul>
            <li>
              當前: <Ref>{existingURL}</Ref>
            </li>
            <li>
              預定: <Ref>{replacementURL}</Ref>
            </li>
          </ul>
          <p>是否使用預定的遠端網址更新?</p>
        </DialogContent>
        <DialogFooter>
          <ButtonGroup destructive={true}>
            <Button type="submit">忽略</Button>
            <Button onClick={this.onUpdate}>更新</Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }

  private onUpdate = () => {
    this.props.onUpdate(this.props.repository)
    this.props.onDismissed()
  }

  private onIgnore = () => {
    this.props.onIgnore(this.props.repository)
    this.props.onDismissed()
  }
}
