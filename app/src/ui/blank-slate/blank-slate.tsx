import * as React from 'react'
import { encodePathAsUrl } from '../../lib/path'
import { UiView } from '../ui-view'
import { Button } from '../lib/button'
import { Octicon, OcticonSymbol } from '../octicons'

interface IBlankSlateProps {
  /** A function to call when the user chooses to create a repository. */
  readonly onCreate: () => void

  /** A function to call when the user chooses to clone a repository. */
  readonly onClone: () => void

  /** A function to call when the user chooses to add a local repository. */
  readonly onAdd: () => void
}

const BlankSlateImageUrl = encodePathAsUrl(
  __dirname,
  'static/empty-no-repo.svg'
)

const ImageStyle: React.CSSProperties = {
  backgroundImage: `url(${BlankSlateImageUrl})`,
}

/**
 * The blank slate view. This is shown when the user hasn't added any
 * repositories to the app.
 */
export class BlankSlateView extends React.Component<IBlankSlateProps, {}> {
  public render() {
    return (
      <UiView id="blank-slate">
        <div className="blankslate-image" style={ImageStyle} />

        <div className="content">
          <div className="title">
            {__DARWIN__ ? 'No Repositories Found' : '找不到存儲庫'}
          </div>

          <div className="callouts">
            <div className="callout">
              <Octicon symbol={OcticonSymbol.plus} />
              <div>建立新項目並將其發佈到 GitHub</div>
              <Button onClick={this.props.onCreate}>
                {__DARWIN__ ? 'Create New Repository' : '建立新存儲庫'}
              </Button>
            </div>

            <div className="callout">
              <Octicon symbol={OcticonSymbol.deviceDesktop} />
              <div>
                在電腦上增加現有項目並將其發佈到 GitHub
              </div>
              <Button onClick={this.props.onAdd}>
                {__DARWIN__
                  ? 'Add a Local Repository'
                  : '增加本機存儲庫'}
              </Button>
            </div>

            <div className="callout">
              <Octicon symbol={OcticonSymbol.repoClone} />
              <div>將現有項目從 GitHub 克隆到您的電腦</div>
              <Button onClick={this.props.onClone}>
                {__DARWIN__ ? 'Clone a Repository' : '克隆存儲庫'}
              </Button>
            </div>
          </div>
        </div>

        <p className="footer">
          或者，您可以拖曳本機存儲庫增加在此處。
        </p>
      </UiView>
    )
  }
}
