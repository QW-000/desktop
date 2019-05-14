import * as React from 'react'
import { Octicon, OcticonSymbol } from '../../octicons'
import { LinkButton } from '../link-button'

export function renderUnmergedFilesSummary(conflictedFilesCount: number) {
  // localization, it burns :vampire:
  const message =
    conflictedFilesCount === 1
      ? `1 衝突的檔案`
      : `${conflictedFilesCount} 衝突的檔案`
  return <h3 className="summary">{message}</h3>
}

export function renderAllResolved() {
  return (
    <div className="all-conflicts-resolved">
      <div className="green-circle">
        <Octicon symbol={OcticonSymbol.check} />
      </div>
      <div className="message">全部衝突都解決了</div>
    </div>
  )
}

export function renderShellLink(openThisRepositoryInShell: () => void) {
  return (
    <div>
      <LinkButton onClick={openThisRepositoryInShell}>
        在命令行中開啟
      </LinkButton>{' '}
      您選擇的工具或關閉以手動解決。
    </div>
  )
}
