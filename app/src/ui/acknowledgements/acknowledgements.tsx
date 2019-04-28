import * as Path from 'path'
import * as Fs from 'fs'
import * as React from 'react'
import { getAppPath } from '../lib/app-proxy'
import { Loading } from '../lib/loading'
import { Button } from '../lib/button'
import { LinkButton } from '../lib/link-button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'

const WebsiteURL = 'https://desktop.github.com'
const RepositoryURL = 'https://github.com/desktop/desktop'

interface IAcknowledgementsProps {
  /** The function to call when the dialog should be dismissed. */
  readonly onDismissed: () => void

  /**
   * The currently installed (and running) version of the app.
   */
  readonly applicationVersion: string
}

interface ILicense {
  readonly repository?: string
  readonly sourceText?: string
  readonly license?: string
}

type Licenses = { [key: string]: ILicense }

interface IAcknowledgementsState {
  readonly licenses: Licenses | null
}

/** The component which displays the licenses for packages used in the app. */
export class Acknowledgements extends React.Component<
  IAcknowledgementsProps,
  IAcknowledgementsState
> {
  private dialogContainerRef: HTMLDivElement | null = null
  private closeButtonRef: HTMLButtonElement | null = null

  private onCloseButtonRef = (element: HTMLButtonElement | null) => {
    this.closeButtonRef = element
  }

  public constructor(props: IAcknowledgementsProps) {
    super(props)

    this.state = { licenses: null }
  }

  public componentDidMount() {
    const path = Path.join(getAppPath(), 'static', 'licenses.json')
    Fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        log.error('Error loading licenses', err)
        return
      }

      const parsed = JSON.parse(data)
      if (!parsed) {
        log.warn(`Couldn't parse licenses!`)
        return
      }

      this.setState({ licenses: parsed })
    })

    // When the dialog is mounted it automatically moves focus to the first
    // focusable element which in this case is a link to an external site. We don't
    // want that so let's just reset it.
    if (this.dialogContainerRef) {
      this.dialogContainerRef.scrollTop = 0
    }

    // And let's just move focus to the close button.
    if (this.closeButtonRef) {
      this.closeButtonRef.focus()
    }
  }

  private renderLicenses(licenses: Licenses) {
    const elements = []
    for (const [index, key] of Object.keys(licenses)
      .sort()
      .entries()) {
      // The first entry is Desktop itself. We don't need to thank us.
      if (index === 0) {
        continue
      }

      const license = licenses[key]
      const repository = license.repository
      let nameElement

      if (repository) {
        const uri = normalizedGitHubURL(repository)
        nameElement = <LinkButton uri={uri}>{key}</LinkButton>
      } else {
        nameElement = key
      }

      let licenseText

      if (license.sourceText) {
        licenseText = license.sourceText
      } else if (license.license) {
        licenseText = `許可證: ${license.license}`
      } else {
        licenseText = '未知許可證'
      }

      const nameHeader = <h2 key={`${key}-header`}>{nameElement}</h2>
      const licenseParagraph = (
        <p key={`${key}-text`} className="license-text">
          {licenseText}
        </p>
      )

      elements.push(nameHeader, licenseParagraph)
    }

    return elements
  }

  public render() {
    const licenses = this.state.licenses

    let desktopLicense: JSX.Element | null = null
    if (licenses) {
      const key = `desktop@${this.props.applicationVersion}`
      const entry = licenses[key]
      desktopLicense = <p className="license-text">{entry.sourceText}</p>
    }

    return (
      <Dialog
        id="acknowledgements"
        title="許可證和開源聲明"
        onSubmit={this.props.onDismissed}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <p>
            <LinkButton uri={WebsiteURL}>GitHub Desktop</LinkButton> 是根據 
            MIT 許可證發布的開源項目。 您可以檢閱程式碼並為此 {' '} 
            <LinkButton uri={RepositoryURL}>GitHub</LinkButton> 項目做出貢獻。
          </p>

          {desktopLicense}

          <p>GitHub Desktop 還發行這些庫:</p>

          {licenses ? this.renderLicenses(licenses) : <Loading />}
        </DialogContent>

        <DialogFooter>
          <ButtonGroup>
            <Button type="submit" onButtonRef={this.onCloseButtonRef}>
              關閉
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}

/** Normalize a package URL to a GitHub URL. */
function normalizedGitHubURL(url: string): string {
  let newURL = url
  newURL = newURL.replace('git+https://github.com', 'https://github.com')
  newURL = newURL.replace('git+ssh://git@github.com', 'https://github.com')
  return newURL
}
