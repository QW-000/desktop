import * as React from 'react'
import { ButtonGroup } from '../lib/button-group'
import { Button } from '../lib/button'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Ref } from '../lib/ref'
import { Repository } from '../../models/repository'
import { TrashNameLabel } from '../lib/context-menu'

interface IConfirmRemoveRepositoryProps {
  /** The repository to be removed */
  readonly repository: Repository

  /** The action to execute when the user confirms */
  readonly onConfirmation: (
    repo: Repository,
    deleteRepoFromDisk: boolean
  ) => void

  /** The action to execute when the user cancels */
  readonly onDismissed: () => void
}

interface IConfirmRemoveRepositoryState {
  readonly deleteRepoFromDisk: boolean
  readonly isRemovingRepository: boolean
}

export class ConfirmRemoveRepository extends React.Component<
  IConfirmRemoveRepositoryProps,
  IConfirmRemoveRepositoryState
> {
  public constructor(props: IConfirmRemoveRepositoryProps) {
    super(props)

    this.state = {
      deleteRepoFromDisk: false,
      isRemovingRepository: false,
    }
  }

  private cancel = () => {
    this.props.onDismissed()
  }

  private onConfirmed = () => {
    this.setState({ isRemovingRepository: true })

    this.props.onConfirmation(
      this.props.repository,
      this.state.deleteRepoFromDisk
    )

    this.props.onDismissed()
  }

  public render() {
    const isRemovingRepository = this.state.isRemovingRepository

    return (
      <Dialog
        id="confirm-remove-repository"
        key="remove-repository-confirmation"
        type="warning"
        title={__DARWIN__ ? 'Remove Repository' : '刪除存儲庫'}
        dismissable={isRemovingRepository ? false : true}
        loading={isRemovingRepository}
        onDismissed={this.cancel}
        onSubmit={this.cancel}
      >
        <DialogContent>
          <p>
            您確定要刪除 "
            {this.props.repository.name}
            " 存儲庫?
          </p>
          <p className="description">
            存儲庫將從 GitHub Desktop 中刪除:
            <br />
            <Ref>{this.props.repository.path}</Ref>
          </p>

          <div>
            <Checkbox
              label={'同時將此存儲庫移動到 ' + TrashNameLabel}
              value={
                this.state.deleteRepoFromDisk
                  ? CheckboxValue.On
                  : CheckboxValue.Off
              }
              onChange={this.onConfirmRepositoryDeletion}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <ButtonGroup destructive={true}>
            <Button disabled={isRemovingRepository} type="submit">
              取消
            </Button>
            <Button onClick={this.onConfirmed} disabled={isRemovingRepository}>
              清除
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }

  private onConfirmRepositoryDeletion = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.checked

    this.setState({ deleteRepoFromDisk: value })
  }
}
