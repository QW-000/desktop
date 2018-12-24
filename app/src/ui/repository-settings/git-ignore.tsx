import * as React from 'react'
import { DialogContent } from '../dialog'
import { TextArea } from '../lib/text-area'
import { LinkButton } from '../lib/link-button'
import { Ref } from '../lib/ref'

interface IGitIgnoreProps {
  readonly text: string | null
  readonly onIgnoreTextChanged: (text: string) => void
  readonly onShowExamples: () => void
}

/** A view for creating or modifying the repository's gitignore file */
export class GitIgnore extends React.Component<IGitIgnoreProps, {}> {
  public render() {
    return (
      <DialogContent>
        <p>
          編輯 <Ref>.gitignore</Ref>. 此檔案指定 Git 應忽略故意未跟踪的檔案， Git 已經跟踪過的檔案不受影響。{' '}
          <LinkButton onClick={this.props.onShowExamples}>
            學到更多
          </LinkButton>
        </p>

        <TextArea
          placeholder="忽略的檔案"
          value={this.props.text || ''}
          onValueChanged={this.props.onIgnoreTextChanged}
          rows={6}
        />
      </DialogContent>
    )
  }
}
