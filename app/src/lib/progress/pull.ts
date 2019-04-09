import { GitProgressParser } from './git'

/**
 * Highly approximate (some would say outright inaccurate) division
 * of the individual progress reporting steps in a pull operation.
 *
 * Note: A pull is essentially the same as a fetch except we might
 * have to check out some files at the end. We assume that these
 * delta updates are fairly quick though.
 */
const steps = [
  { title: '遠端: 壓縮項目', weight: 0.1 },
  { title: '接收項目', weight: 0.7 },
  { title: '分析增量', weight: 0.15 },
  { title: '校對檔案', weight: 0.15 },
]

/**
 * A utility class for interpreting the output from `git pull --progress`
 * and turning that into a percentage value estimating the overall progress
 * of the pull.
 */
export class PullProgressParser extends GitProgressParser {
  public constructor() {
    super(steps)
  }
}
