import * as React from 'react'

import { UiView } from './ui-view'
import { Dispatcher } from './dispatcher'
import { Repository } from '../models/repository'

import { Button } from './lib/button'
import { Row } from './lib/row'
import { LinkButton } from './lib/link-button'

interface IMissingRepositoryProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
}

/** The view displayed when a repository is missing. */
export class MissingRepository extends React.Component<
  IMissingRepositoryProps,
  {}
> {
  public render() {
    const buttons = new Array<JSX.Element>()
    buttons.push(
      <Button key="locate" onClick={this.locate} type="submit">
        定位…
      </Button>
    )

    if (this.canCloneAgain()) {
      buttons.push(
        <Button key="clone-again" onClick={this.cloneAgain}>
          再次克隆
        </Button>
      )
    }

    buttons.push(
      <Button key="remove" onClick={this.remove}>
        清除
      </Button>
    )

    return (
      <UiView id="missing-repository-view">
        <div className="title-container">
          <div className="title">找不到 "{this.props.repository.name}"</div>
          <div className="details">
            最後一次出現{' '}
            <span className="路徑">{this.props.repository.path}</span>。{' '}
            <LinkButton onClick={this.checkAgain}>再次檢查。&nbsp;</LinkButton>
          </div>
        </div>

        <Row>{buttons}</Row>
      </UiView>
    )
  }

  private canCloneAgain() {
    const gitHubRepository = this.props.repository.gitHubRepository
    return gitHubRepository && gitHubRepository.cloneURL
  }

  private checkAgain = () => {
    this.props.dispatcher.refreshRepository(this.props.repository)
  }

  private remove = () => {
    this.props.dispatcher.removeRepository(this.props.repository, false)
  }

  private locate = () => {
    this.props.dispatcher.relocateRepository(this.props.repository)
  }

  private cloneAgain = async () => {
    const gitHubRepository = this.props.repository.gitHubRepository
    if (!gitHubRepository) {
      return
    }

    const cloneURL = gitHubRepository.cloneURL
    if (!cloneURL) {
      return
    }

    try {
      await this.props.dispatcher.cloneAgain(
        cloneURL,
        this.props.repository.path
      )
    } catch (error) {
      this.props.dispatcher.postError(error)
    }
  }
}
