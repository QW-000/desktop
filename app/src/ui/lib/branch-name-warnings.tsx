import * as React from 'react'
import { Branch, BranchType } from '../../models/branch'

import { Row } from './row'
import { Octicon, OcticonSymbol } from '../octicons'
import { Ref } from './ref'
import { IStashEntry } from '../../models/stash-entry'

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

export function renderStashWillBeLostWarning(stash: IStashEntry | null) {
  if (stash === null) {
    return null
  }
  return (
    <Row className="warning-helper-text">
      <Octicon symbol={OcticonSymbol.alert} />
      <p>
        如果重新命名該分支，則您在該分支上當前藏匿的變更將不再在 GitHub Desktop 中可見。
      </p>
    </Row>
  )
}
