import * as React from 'react'
import { Ref } from './ref'
import { LinkButton } from './link-button'
import { unlink } from 'fs-extra'

interface IConfigLockFileExistsProps {
  /**
   * The path to the lock file that's preventing a configuration
   * file update.
   */
  readonly lockFilePath: string

  /**
   * Called when the lock file has been deleted and the configuration
   * update can be retried
   */
  readonly onLockFileDeleted: () => void

  /**
   * Called if the lock file couldn't be deleted
   */
  readonly onError: (e: Error) => void
}

export class ConfigLockFileExists extends React.Component<
  IConfigLockFileExistsProps
> {
  private onDeleteLockFile = async () => {
    try {
      await unlink(this.props.lockFilePath)
    } catch (e) {
      // We don't care about failure to unlink due to the
      // lock file not existing any more
      if (e.code !== 'ENOENT') {
        this.props.onError(e)
        return
      }
    }

    this.props.onLockFileDeleted()
  }
  public render() {
    return (
      <div className="config-lock-file-exists-component">
        <p>
          無法更新 Git 組態檔案。 鎖定檔案已經存在於 {' '}
          <Ref>{this.props.lockFilePath}</Ref>。
        </p>
        <p>
          如果當前有其它工具正在修改 Git 組態，或者 Git 處理程序尚在未清理鎖定檔案的情況下提前終止
          ，則可能會發生這種情況。您是否要 {' '}
          <LinkButton onClick={this.onDeleteLockFile}>
            刪除鎖定檔案
          </LinkButton>{' '}
          然後重試?
        </p>
      </div>
    )
  }
}
