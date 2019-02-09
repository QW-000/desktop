import * as React from 'react'
import { Branch, BranchType } from '../../models/branch'

import { Row } from './row'
import { Octicon, OcticonSymbol } from '../octicons'
import { Ref } from './ref'

export function renderBranchNameWarning(
  proposedName: string,
  sanitizedName: string
) {
  if (proposedName.length > 0 && /^\s*$/.test(sanitizedName)) {
    return (
      <Row className="warning-helper-text">
        <Octicon symbol={OcticonSymbol.alert} />
        <p>
          <Ref>{proposedName}</Ref> 不是有效的分支名稱。
        </p>
      </Row>
    )
  } else if (proposedName !== sanitizedName) {
    return (
      <Row className="warning-helper-text">
        <Octicon symbol={OcticonSymbol.alert} />
        <p>
          將建立為 <Ref>{sanitizedName}</Ref>.
        </p>
      </Row>
    )
  } else {
    return null
  }
}
export function renderBranchHasRemoteWarning(branch: Branch) {
  if (branch.upstream != null) {
    return (
      <Row className="warning-helper-text">
        <Octicon symbol={OcticonSymbol.alert} />
        <p>
          此分支正在跟踪 <Ref>{branch.upstream}</Ref> 並重新命名此分支不會變更遠端分支名稱。
        </p>
      </Row>
    )
  } else {
    return null
  }
}

export function renderBranchNameExistsOnRemoteWarning(
  sanitizedName: string,
  branches: ReadonlyArray<Branch>
) {
  const alreadyExistsOnRemote =
    branches.findIndex(
      b => b.nameWithoutRemote === sanitizedName && b.type === BranchType.Remote
    ) > -1

  if (alreadyExistsOnRemote === false) {
    return null
  }

  return (
    <Row className="warning-helper-text">
      <Octicon symbol={OcticonSymbol.alert} />
      <p>
        遠端上已存在名為 <Ref>{sanitizedName}</Ref> 的分支。
      </p>
    </Row>
  )
}
