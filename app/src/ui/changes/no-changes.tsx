import * as React from 'react'

import { encodePathAsUrl } from '../../lib/path'
import { revealInFileManager } from '../../lib/app-shell'
import { Repository } from '../../models/repository'
import { LinkButton } from '../lib/link-button'

const BlankSlateImage = encodePathAsUrl(
  __dirname,
  'static/empty-no-file-selected.svg'
)

interface INoChangesProps {
  readonly repository: Repository
}

/** The component to display when there are no local changes. */
export class NoChanges extends React.Component<INoChangesProps, {}> {
  public render() {
    const opener = __DARWIN__
      ? 'Finder'
      : __WIN32__
      ? '瀏覽器'
      : '你的檔案管理器'
    return (
      <div className="panel blankslate" id="no-changes">
        <img src={BlankSlateImage} className="blankslate-image" />
        <div>本機無任何變更</div>

        <div>
           是否想要在{' '}{opener}{' '}
          <LinkButton onClick={this.open}>開啟這個存儲庫</LinkButton> 
          ?
        </div>
      </div>
    )
  }

  private open = () => {
    revealInFileManager(this.props.repository, '')
  }
}
