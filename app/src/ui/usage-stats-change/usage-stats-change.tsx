import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Row } from '../lib/row'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IUsageStatsChangeProps {
  readonly onSetStatsOptOut: (optOut: boolean) => void
  readonly onDismissed: () => void
  readonly onOpenUsageDataUrl: () => void
}

interface IUsageStatsChangeState {
  readonly optOutOfUsageTracking: boolean
}

/**
 * The dialog shown if the user has not seen the details about how our usage
 * tracking has changed
 */
export class UsageStatsChange extends React.Component<
  IUsageStatsChangeProps,
  IUsageStatsChangeState
> {
  public constructor(props: IUsageStatsChangeProps) {
    super(props)

    this.state = {
      optOutOfUsageTracking: false,
    }
  }

  public render() {
    return (
      <Dialog
        id="usage-reporting"
        title={
          __DARWIN__ ? 'Usage Reporting Changes' : '使用變化報告'
        }
        dismissable={false}
        onDismissed={this.onDismissed}
        onSubmit={this.onDismissed}
        type="normal"
      >
        <DialogContent>
          <Row>
            GitHub Desktop 採取有關如何報告使用情況的狀態變化，幫助我們更好地了解 GitHub 用戶如何從 Desktop 獲取值:
          </Row>
          <Row>
            <ul>
              <li>
                <span>
                  <strong>如果您已登入 GitHub 帳戶</strong>, 您的
                  GitHub.com 帳戶 ID 將包含在定期使用狀態中。
                </span>
              </li>
              <li>
                <span>
                  <strong>
                    如果只是登入到 GitHub Enterprise 帳戶，或者只使用帶有非 GitHub 遠端控制台的 Desktop
                  </strong>
                  什麼都不會改變。
                </span>
              </li>
            </ul>
          </Row>
          <Row className="selection">
            <Checkbox
              label="由提交使用狀態來幫助改善 GitHub Desktop"
              value={
                this.state.optOutOfUsageTracking
                  ? CheckboxValue.Off
                  : CheckboxValue.On
              }
              onChange={this.onReportingOptOutChanged}
            />
          </Row>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="繼續"
            cancelButtonText={__DARWIN__ ? 'More Info' : '更多資訊'}
            onCancelButtonClick={this.viewMoreInfo}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onReportingOptOutChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = !event.currentTarget.checked
    this.setState({ optOutOfUsageTracking: value })
  }

  private onDismissed = () => {
    this.props.onSetStatsOptOut(this.state.optOutOfUsageTracking)
    this.props.onDismissed()
  }

  private viewMoreInfo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    this.props.onOpenUsageDataUrl()
  }
}
