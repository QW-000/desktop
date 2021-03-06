import * as React from 'react'
import { Octicon, OcticonSymbol } from '../octicons'
import { Banner } from './banner'

export function SuccessfulMerge({
  ourBranch,
  theirBranch,
  onDismissed,
}: {
  readonly ourBranch: string
  readonly theirBranch?: string
  readonly onDismissed: () => void
}) {
  const message =
    theirBranch !== undefined ? (
      <span>
        {'成功合併 '}
        <strong>{theirBranch}</strong>
        {' 為 '}
        <strong>{ourBranch}</strong>
      </span>
    ) : (
      <span>
        {'成功合併到 '}
        <strong>{ourBranch}</strong>
      </span>
    )

  return (
    <Banner id="successful-merge" timeout={5000} onDismissed={onDismissed}>
      <div className="green-circle">
        <Octicon className="check-icon" symbol={OcticonSymbol.check} />
      </div>
      <div className="banner-message">{message}</div>
    </Banner>
  )
}
