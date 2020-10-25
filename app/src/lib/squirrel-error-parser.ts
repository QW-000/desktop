// an error that Electron raises when it can't find the installation for the running app
const squirrelMissingRegex = /^Can not find Squirrel$/

// an error that occurs when Squirrel isn't able to reach the update server
const squirrelDNSRegex = /System\.Net\.WebException: The remote name could not be resolved: 'central\.github\.com'/

// an error that occurs when the connection times out during updating
const squirrelTimeoutRegex = /A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond/

/**
 * This method parses known error messages from Squirrel.Windows and returns a
 * friendlier message to the user.
 *
 * @param error The underlying error from Squirrel.
 *
 */
export function parseError(error: Error): Error | null {
  if (squirrelMissingRegex.test(error.message)) {
    return new Error(
      '應用程式缺少安裝更新檢查時所需的依賴項。 這非常非常糟糕。'
    )
  }
  if (squirrelDNSRegex.test(error.message)) {
    return new Error(
      'GitHub Desktop 無法取得更新服務器。 確定已連線網際網路，然後重試。'
    )
  }
  if (squirrelTimeoutRegex.test(error.message)) {
    return new Error(
      '由於超時，GitHub Desktop 無法檢查更新。 確定已連線網際網路，然後重試。'
    )
  }

  return null
}
