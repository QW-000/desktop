import { GitProgressParser } from './git'

/**
 * Highly approximate (some would say outright inaccurate) division
 * of the individual progress reporting steps in a push operation
 */
const steps = [
  { title: '壓縮項目', weight: 0.2 },
  { title: '寫入項目', weight: 0.7 },
  { title: '遠端: 分析增量', weight: 0.1 },
]

/**
 * A utility class for interpreting the output from `git push --progress`
 * and turning that into a percentage value estimating the overall progress
 * of the clone.
 */
export class PushProgressParser extends GitProgressParser {
  public constructor() {
    super(steps)
  }
}
