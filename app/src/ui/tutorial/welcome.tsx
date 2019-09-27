import * as React from 'react'

import { encodePathAsUrl } from '../../lib/path'

const CodeImage = encodePathAsUrl(__dirname, 'static/code.svg')
const TeamDiscussionImage = encodePathAsUrl(
  __dirname,
  'static/github-for-teams.svg'
)
const CloudServerImage = encodePathAsUrl(
  __dirname,
  'static/github-for-business.svg'
)

export class TutorialWelcome extends React.Component {
  public render() {
    return (
      <div id="tutorial-welcome">
        <div className="header">
          <h1>歡迎使用 GitHub Desktop</h1>
          <p>
            本教學可以更自在的使用 Git、GitHub 與 GitHub Desktop。
          </p>
        </div>
        <ul className="definitions">
          <li>
            <img src={CodeImage} />
            <p>
              <strong>Git</strong> 是版本控制系統。
            </p>
          </li>
          <li>
            <img src={TeamDiscussionImage} />
            <p>
              <strong>GitHub</strong> 是您存儲程式碼並與他人合作的地方。
            </p>
          </li>
          <li>
            <img src={CloudServerImage} />
            <p>
              <strong>GitHub Desktop</strong> 幫助您在本機使用 GitHub。
            </p>
          </li>
        </ul>
      </div>
    )
  }
}
