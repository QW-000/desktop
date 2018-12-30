import * as React from 'react'
import * as URL from 'url'
import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'

interface IUntrustedCertificateProps {
  /** The untrusted certificate. */
  readonly certificate: Electron.Certificate

  /** The URL which was being accessed. */
  readonly url: string

  /** The function to call when the user chooses to dismiss the dialog. */
  readonly onDismissed: () => void

  /**
   * The function to call when the user chooses to continue in the process of
   * trusting the certificate.
   */
  readonly onContinue: (certificate: Electron.Certificate) => void
}

/**
 * The dialog we display when an API request encounters an untrusted
 * certificate.
 */
export class UntrustedCertificate extends React.Component<
  IUntrustedCertificateProps,
  {}
> {
  public render() {
    const host = URL.parse(this.props.url).hostname
    const type = __DARWIN__ ? 'warning' : 'error'
    const buttonGroup = __DARWIN__ ? (
      <ButtonGroup destructive={true}>
        <Button type="submit">取消</Button>
        <Button onClick={this.onContinue}>檢視憑證</Button>
      </ButtonGroup>
    ) : (
      <ButtonGroup>
        <Button type="submit">關閉</Button>
        <Button onClick={this.onContinue}>增加憑證</Button>
      </ButtonGroup>
    )
    return (
      <Dialog
        title={__DARWIN__ ? 'Untrusted Server' : '不受信賴的服務器'}
        onDismissed={this.props.onDismissed}
        onSubmit={this.props.onDismissed}
        type={type}
      >
        <DialogContent>
          <p>
            GitHub Desktop 無法驗證 {host} 的身份。 憑證
            ({this.props.certificate.subjectName}) 無效或不受信賴。{' '}
            <strong>
              有可能攻擊者正在嘗試竊取您的資料。
            </strong>
          </p>
          <p>在某些情況下，這可能是預期的。 例如:</p>
          <ul>
            <li>如果這是 GitHub Enterprise 試用版。</li>
            <li>
              如果您的 GitHub Enterprise 狀況在不正常的頂層領域上執行。
            </li>
          </ul>
          <p>
            如果您不確定該怎麼做，請取消並聯絡您的系統管理員。
          </p>
        </DialogContent>
        <DialogFooter>{buttonGroup}</DialogFooter>
      </Dialog>
    )
  }

  private onContinue = () => {
    this.props.onContinue(this.props.certificate)
  }
}
