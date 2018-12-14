import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { ButtonGroup } from '../lib/button-group'
import { Button } from '../lib/button'
import { Row } from '../lib/row'
import { Checkbox, CheckboxValue } from '../lib/checkbox'

interface IUsageStatsChangeProps {
  readonly onDismissed: (optOut: boolean) => void
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
          __DARWIN__ ? 'Usage Reporting Changes' : '�ϥγ��i�ܧ�'
        }
        dismissable={false}
        onDismissed={this.onDismissed}
        onSubmit={this.onDismissed}
        type="normal"
      >
        <DialogContent>
          <Row>
            GitHub Desktop �Ĩ������p����i�ϥα��p�����A�ܤơA���U�ڭ̧�n�a�F�� GitHub �Τ�p��q Desktop �����:
          </Row>
          <Row>
            <ul>
              <li>
                <span>
                  <strong>�p�G�z�w�n�J GitHub �b��</strong>, �z��
                  GitHub.com �b�� ID �N�]�t�b�w���ϥΪ��A���C
                </span>
              </li>
              <li>
                <span>
                  <strong>
                    �p�G�u�O�n�J�� GitHub Enterprise �b��A�Ϊ̥u�ϥαa���D GitHub ���ݱ���x�� Desktop
                  </strong>
                  ���򳣤��|���ܡC
                </span>
              </li>
            </ul>
          </Row>
          <Row className="selection">
            <Checkbox
              label="�Ѵ���ϥΪ��A�����U�ﵽ GitHub Desktop"
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
          <ButtonGroup>
            <Button type="submit">�~��</Button>
            <Button onClick={this.viewMoreInfo}>
              {' '}
              {__DARWIN__ ? 'More Info' : '��h��T'}
            </Button>
          </ButtonGroup>
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
    this.props.onDismissed(this.state.optOutOfUsageTracking)
  }

  private viewMoreInfo = () => {
    this.props.onOpenUsageDataUrl()
  }
}
