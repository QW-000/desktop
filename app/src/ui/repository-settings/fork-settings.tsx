import * as React from 'react'
import { DialogContent } from '../dialog'
import { ForkContributionTarget } from '../../models/workflow-preferences'
import { RepositoryWithForkedGitHubRepository } from '../../models/repository'
import { ForkSettingsDescription } from './fork-contribution-target-description'

interface IForkSettingsProps {
  readonly forkContributionTarget: ForkContributionTarget
  readonly repository: RepositoryWithForkedGitHubRepository
  readonly onForkContributionTargetChanged: (
    forkContributionTarget: ForkContributionTarget
  ) => void
}

enum RadioButtonId {
  Parent = 'ForkContributionTargetParent',
  Self = 'ForkContributionTargetSelf',
}

/** A view for creating or modifying the repository's gitignore file */
export class ForkSettings extends React.Component<IForkSettingsProps, {}> {
  public render() {
    return (
      <DialogContent>
        <h2>我將使用這個分叉…</h2>

        <div className="radio-component">
          <input
            type="radio"
            id={RadioButtonId.Parent}
            value={ForkContributionTarget.Parent}
            checked={
              this.props.forkContributionTarget ===
              ForkContributionTarget.Parent
            }
            onChange={this.onForkContributionTargetChanged}
          />
          <label htmlFor={RadioButtonId.Parent}>
            為上代存儲庫做出貢獻
          </label>
        </div>
        <div className="radio-component">
          <input
            type="radio"
            id={RadioButtonId.Self}
            value={ForkContributionTarget.Self}
            checked={
              this.props.forkContributionTarget === ForkContributionTarget.Self
            }
            onChange={this.onForkContributionTargetChanged}
          />
          <label htmlFor={RadioButtonId.Self}>對於我自己的目的</label>
        </div>

        <ForkSettingsDescription
          repository={this.props.repository}
          forkContributionTarget={this.props.forkContributionTarget}
        />
      </DialogContent>
    )
  }

  private onForkContributionTargetChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value as ForkContributionTarget

    this.props.onForkContributionTargetChanged(value)
  }
}
