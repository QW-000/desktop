import * as React from 'react'

import { assertNever } from '../../lib/fatal-error'
import { encodePathAsUrl } from '../../lib/path'

import { Repository } from '../../models/repository'
import {
  CommittedFileChange,
  WorkingDirectoryFileChange,
  AppFileStatusKind,
  isManualConflict,
  isConflictedFileStatus,
} from '../../models/status'
import {
  DiffSelection,
  DiffType,
  IDiff,
  IImageDiff,
  ITextDiff,
  ILargeTextDiff,
  ImageDiffType,
} from '../../models/diff'
import { Button } from '../lib/button'
import {
  NewImageDiff,
  ModifiedImageDiff,
  DeletedImageDiff,
} from './image-diffs'
import { BinaryFile } from './binary-file'
import { TextDiff } from './text-diff'

// image used when no diff is displayed
const NoDiffImage = encodePathAsUrl(__dirname, 'static/ufo-alert.svg')

type ChangedFile = WorkingDirectoryFileChange | CommittedFileChange

/** The props for the Diff component. */
interface IDiffProps {
  readonly repository: Repository

  /**
   * Whether the diff is readonly, e.g., displaying a historical diff, or the
   * diff's lines can be selected, e.g., displaying a change in the working
   * directory.
   */
  readonly readOnly: boolean

  /** The file whose diff should be displayed. */
  readonly file: ChangedFile

  /** Called when the includedness of lines or a range of lines has changed. */
  readonly onIncludeChanged?: (diffSelection: DiffSelection) => void

  /** The diff that should be rendered */
  readonly diff: IDiff

  /** The type of image diff to display. */
  readonly imageDiffType: ImageDiffType

  /** Hiding whitespace in diff. */
  readonly hideWhitespaceInDiff: boolean

  /**
   * Called when the user requests to open a binary file in an the
   * system-assigned application for said file type.
   */
  readonly onOpenBinaryFile: (fullPath: string) => void

  /**
   * Called when the user is viewing an image diff and requests
   * to change the diff presentation mode.
   */
  readonly onChangeImageDiffType: (type: ImageDiffType) => void

  /*
   * Called when the user wants to discard a selection of the diff.
   * Only applicable when readOnly is false.
   */
  readonly onDiscardChanges?: (
    diff: ITextDiff,
    diffSelection: DiffSelection
  ) => void
}

interface IDiffState {
  readonly forceShowLargeDiff: boolean
}

/** A component which renders a diff for a file. */
export class Diff extends React.Component<IDiffProps, IDiffState> {
  public constructor(props: IDiffProps) {
    super(props)

    this.state = {
      forceShowLargeDiff: false,
    }
  }

  public render() {
    const diff = this.props.diff

    switch (diff.kind) {
      case DiffType.Text:
        return this.renderText(diff)
      case DiffType.Binary:
        return this.renderBinaryFile()
      case DiffType.Image:
        return this.renderImage(diff)
      case DiffType.LargeText: {
        return this.state.forceShowLargeDiff
          ? this.renderLargeText(diff)
          : this.renderLargeTextDiff()
      }
      case DiffType.Unrenderable:
        return this.renderUnrenderableDiff()
      default:
        return assertNever(diff, `Unsupported diff type: ${diff}`)
    }
  }

  private renderImage(imageDiff: IImageDiff) {
    if (imageDiff.current && imageDiff.previous) {
      return (
        <ModifiedImageDiff
          onChangeDiffType={this.props.onChangeImageDiffType}
          diffType={this.props.imageDiffType}
          current={imageDiff.current}
          previous={imageDiff.previous}
        />
      )
    }

    if (
      imageDiff.current &&
      (this.props.file.status.kind === AppFileStatusKind.New ||
        this.props.file.status.kind === AppFileStatusKind.Untracked)
    ) {
      return <NewImageDiff current={imageDiff.current} />
    }

    if (
      imageDiff.previous &&
      this.props.file.status.kind === AppFileStatusKind.Deleted
    ) {
      return <DeletedImageDiff previous={imageDiff.previous} />
    }

    return null
  }

  private renderLargeTextDiff() {
    return (
      <div className="panel empty large-diff">
        <img src={NoDiffImage} className="blankslate-image" />
        <p>
          差異過大，預設情況下無法顯示。
          <br />
          您仍然可以嘗試顯示它，但效能可能會受到負面影響。
        </p>
        <Button onClick={this.showLargeDiff}>
          {__DARWIN__ ? '顯示差異' : '顯示差異'}
        </Button>
      </div>
    )
  }

  private renderUnrenderableDiff() {
    return (
      <div className="panel empty large-diff">
        <img src={NoDiffImage} />
        <p>差異過大而無法顯示。</p>
      </div>
    )
  }

  private renderLargeText(diff: ILargeTextDiff) {
    // guaranteed to be set since this function won't be called if text or hunks are null
    const textDiff: ITextDiff = {
      text: diff.text,
      hunks: diff.hunks,
      kind: DiffType.Text,
      lineEndingsChange: diff.lineEndingsChange,
    }

    return this.renderTextDiff(textDiff)
  }

  private renderText(diff: ITextDiff) {
    if (diff.hunks.length === 0) {
      if (
        this.props.file.status.kind === AppFileStatusKind.New ||
        this.props.file.status.kind === AppFileStatusKind.Untracked
      ) {
        return <div className="panel empty">此檔案是空的</div>
      }

      if (this.props.file.status.kind === AppFileStatusKind.Renamed) {
        return (
          <div className="panel renamed">
            此檔案已重新命名但未變更
          </div>
        )
      }

      if (
        isConflictedFileStatus(this.props.file.status) &&
        isManualConflict(this.props.file.status)
      ) {
        return (
          <div className="panel empty">
            此檔案存在衝突，必須經由命令行解決。
          </div>
        )
      }

      if (this.props.hideWhitespaceInDiff) {
        return <div className="panel empty">只發現空變更</div>
      }

      return <div className="panel empty">未找到任何的內容變更</div>
    }

    return this.renderTextDiff(diff)
  }

  private renderBinaryFile() {
    return (
      <BinaryFile
        path={this.props.file.path}
        repository={this.props.repository}
        onOpenBinaryFile={this.props.onOpenBinaryFile}
      />
    )
  }

  private renderTextDiff(diff: ITextDiff) {
    return (
      <TextDiff
        repository={this.props.repository}
        file={this.props.file}
        readOnly={this.props.readOnly}
        onIncludeChanged={this.props.onIncludeChanged}
        onDiscardChanges={this.props.onDiscardChanges}
        diff={diff}
      />
    )
  }

  private showLargeDiff = () => {
    this.setState({ forceShowLargeDiff: true })
  }
}
