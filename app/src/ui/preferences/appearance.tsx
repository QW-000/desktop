import * as React from 'react'
import { DialogContent } from '../dialog'
import {
  VerticalSegmentedControl,
  ISegmentedItem,
} from '../lib/vertical-segmented-control'
import { ApplicationTheme } from '../lib/application-theme'
import { fatalError } from '../../lib/fatal-error'

interface IAppearanceProps {
  readonly selectedTheme: ApplicationTheme
  readonly onSelectedThemeChanged: (theme: ApplicationTheme) => void
}

const themes: ReadonlyArray<ISegmentedItem> = [
  { title: '明亮', description: 'GitHub Desktop 的預設主題' },
  {
    title: '黑暗 (測試版)',
    description:
      '黑暗主題測試版仍在開發中，將可能遇到的任何問題報告給我們追蹤。',
  },
]

export class Appearance extends React.Component<IAppearanceProps, {}> {
  private onSelectedThemeChanged = (index: number) => {
    if (index === 0) {
      this.props.onSelectedThemeChanged(ApplicationTheme.Light)
    } else if (index === 1) {
      this.props.onSelectedThemeChanged(ApplicationTheme.Dark)
    } else {
      fatalError(`未知的主題索引 ${index}`)
    }
  }

  public render() {
    const selectedIndex =
      this.props.selectedTheme === ApplicationTheme.Dark ? 1 : 0

    return (
      <DialogContent>
        <VerticalSegmentedControl
          items={themes}
          selectedIndex={selectedIndex}
          onSelectionChanged={this.onSelectedThemeChanged}
        />
      </DialogContent>
    )
  }
}
