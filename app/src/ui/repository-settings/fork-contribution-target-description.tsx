import * as React from 'react'
import { ForkContributionTarget } from '../../models/workflow-preferences'
import { RepositoryWithForkedGitHubRepository } from '../../models/repository'

interface IForkSettingsDescription {
  readonly repository: RepositoryWithForkedGitHubRepository
  readonly forkContributionTarget: ForkContributionTarget
}

export function ForkSettingsDescription(props: IForkSettingsDescription) {
  // We can't use the getNonForkGitHubRepository() helper since we need to calculate
  // the value based on the temporary form state.
  const targetRepository =
    props.forkContributionTarget === ForkContributionTarget.Self
      ? props.repository.gitHubRepository
      : props.repository.gitHubRepository.parent

  return (
    <ul className="fork-settings-description">
      <li>
        定位到 <strong>{targetRepository.fullName}</strong>{' '}
        的拉取請求將顯示在拉取請求清單中。
      </li>
      <li>
        論題將在 <strong>{targetRepository.fullName}</strong> 中建立。
      </li>
      <li>
        "在 Github 上檢視" 將在瀏覽器中開啟 <strong>{targetRepository.fullName}</strong>{' '}。
      </li>
      <li>
        新分支將基於 {' '}
        <strong>{targetRepository.fullName}</strong> 的預設分支。
      </li>
      <li>
        使用者及論題的自動完成將基於 {' '}
        <strong>{targetRepository.fullName}</strong>。
      </li>
    </ul>
  )
}
