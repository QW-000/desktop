import * as React from 'react'
import { encodePathAsUrl } from '../../lib/path'
import { Button } from '../lib/button'

const BlankSlateImage = encodePathAsUrl(
  __dirname,
  'static/empty-no-branches.svg'
)

interface INoBranchesProps {
  /** The callback to invoke when the user wishes to create a new branch */
  readonly onCreateNewBranch: () => void
  /** True to display the UI elements for creating a new branch, false to hide them */
  readonly canCreateNewBranch: boolean
}

export class NoBranches extends React.Component<INoBranchesProps> {
  public render() {
    if (this.props.canCreateNewBranch) {
      return (
        <div className="no-branches">
          <img src={BlankSlateImage} className="blankslate-image" />

          <div className="title">抱歉，無法找到此分支</div>

          <div className="subtitle">
            你想要建立一個新的分支嗎?
          </div>

          <Button
            className="create-branch-button"
            onClick={this.props.onCreateNewBranch}
            type="submit"
          >
            {__DARWIN__ ? 'Create New Branch' : '建立新分支'}
          </Button>

          <div className="protip">
            專家提示! 按下 {this.renderShortcut()} 可在應用程式中任何位置快速建立新分支
          </div>
        </div>
      )
    }

    return <div className="no-branches">抱歉，無法找到此分支</div>
  }

  private renderShortcut() {
    if (__DARWIN__) {
      return (
        <span>
          <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>N</kbd>
        </span>
      )
    } else {
      return (
        <span>
          <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd>
        </span>
      )
    }
  }
}
