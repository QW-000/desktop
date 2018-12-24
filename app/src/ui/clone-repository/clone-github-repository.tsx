import * as React from 'react'

import { Account } from '../../models/account'
import { DialogContent } from '../dialog'
import { TextBox } from '../lib/text-box'
import { Row } from '../lib/row'
import { Button } from '../lib/button'
import { IAPIRepository } from '../../lib/api'
import { CloneableRepositoryFilterList } from './cloneable-repository-filter-list'

interface ICloneGithubRepositoryProps {
  /** The account to clone from. */
  readonly account: Account

  /** The path to clone to. */
  readonly path: string

  /** Called when the destination path changes. */
  readonly onPathChanged: (path: string) => void

  /**
   * Called when the user should be prompted to choose a destination directory.
   */
  readonly onChooseDirectory: () => Promise<string | undefined>

  /**
   * The currently selected repository, or null if no repository
   * is selected.
   */
  readonly selectedItem: IAPIRepository | null

  /** Called when a repository is selected. */
  readonly onSelectionChanged: (selectedItem: IAPIRepository | null) => void

  /**
   * The list of repositories that the account has explicit permissions
   * to access, or null if no repositories has been loaded yet.
   */
  readonly repositories: ReadonlyArray<IAPIRepository> | null

  /**
   * Whether or not the list of repositories is currently being loaded
   * by the API Repositories Store. This determines whether the loading
   * indicator is shown or not.
   */
  readonly loading: boolean

  /**
   * The contents of the filter text box used to filter the list of
   * repositories.
   */
  readonly filterText: string

  /**
   * Called when the filter text is changed by the user entering a new
   * value in the filter text box.
   */
  readonly onFilterTextChanged: (filterText: string) => void

  /**
   * Called when the user requests a refresh of the repositories
   * available for cloning.
   */
  readonly onRefreshRepositories: (account: Account) => void
}

export class CloneGithubRepository extends React.PureComponent<
  ICloneGithubRepositoryProps
> {
  public render() {
    return (
      <DialogContent className="clone-github-repository-content">
        <Row>
          <CloneableRepositoryFilterList
            account={this.props.account}
            selectedItem={this.props.selectedItem}
            onSelectionChanged={this.props.onSelectionChanged}
            loading={this.props.loading}
            repositories={this.props.repositories}
            filterText={this.props.filterText}
            onFilterTextChanged={this.props.onFilterTextChanged}
            onRefreshRepositories={this.props.onRefreshRepositories}
          />
        </Row>

        <Row className="local-path-field">
          <TextBox
            value={this.props.path}
            label={__DARWIN__ ? 'Local Path' : '本機路徑'}
            placeholder="存儲庫路徑"
            onValueChanged={this.props.onPathChanged}
          />
          <Button onClick={this.props.onChooseDirectory}>選擇…</Button>
        </Row>
      </DialogContent>
    )
  }

  private renderRepositoryList() {
    if (
      this.props.loading &&
      (this.props.repositories === null || this.props.repositories.length === 0)
    ) {
      return (
        <div className="clone-github-repo clone-loading">
          <Loading /> 載入存儲庫…
        </div>
      )
    }

    const groups = this.getRepositoryGroups(this.props.repositories)
    const selectedItem = this.getSelectedListItem(
      groups,
      this.props.selectedItem
    )

    return (
      <FilterList<IClonableRepositoryListItem>
        className="clone-github-repo"
        rowHeight={RowHeight}
        selectedItem={selectedItem}
        renderItem={this.renderItem}
        renderGroupHeader={this.renderGroupHeader}
        onSelectionChanged={this.onSelectionChanged}
        invalidationProps={groups}
        groups={groups}
        filterText={this.props.filterText}
        onFilterTextChanged={this.props.onFilterTextChanged}
        renderNoItems={this.noMatchingRepositories}
        renderPostFilter={this.renderPostFilter}
      />
    )
  }

  private renderPostFilter = () => {
    return (
      <Button
        disabled={this.props.loading}
        onClick={this.refreshRepositories}
        tooltip="更新存儲庫清單"
      >
        <Octicon
          symbol={OcticonSymbol.sync}
          className={this.props.loading ? 'spin' : undefined}
        />
      </Button>
    )
  }

  private noMatchingRepositories = function() {
    return (
      <div className="no-results-found">
        抱歉，找不到此存儲庫。
      </div>
    )
  }

  private onSelectionChanged = (item: IClonableRepositoryListItem | null) => {
    if (item === null || this.props.repositories === null) {
      this.props.onSelectionChanged(null)
    } else {
      this.props.onSelectionChanged(
        this.props.repositories.find(r => r.clone_url === item.url) || null
      )
    }
  }

  private onPathChanged = (path: string) => {
    this.props.onPathChanged(path)
  }

  private renderGroupHeader = (identifier: string) => {
    let header = identifier
    if (identifier === YourRepositoriesIdentifier) {
      header = __DARWIN__ ? 'Your Repositories' : '你的存儲庫'
    }
    return (
      <div className="clone-repository-list-content clone-repository-list-group-header">
        {header}
      </div>
    )
  }

  private renderItem = (
    item: IClonableRepositoryListItem,
    matches: IMatches
  ) => {
    return (
      <div className="clone-repository-list-item">
        <Octicon className="icon" symbol={item.icon} />
        <div className="name" title={item.text[0]}>
          <HighlightText text={item.text[0]} highlight={matches.title} />
        </div>
      </div>
    )
  }
}
