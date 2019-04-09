import { GitProgressParser } from './git'

/**
 * Highly approximate (some would say outright inaccurate) division
 * of the individual progress reporting steps in a clone operation
 */
const steps = [
  { title: '遠端: 壓縮項目', weight: 0.1 },
  { title: '接收項目', weight: 0.6 },
  { title: '分析增量', weight: 0.1 },
  { title: '校對檔案', weight: 0.2 },
]

/**
 * A utility class for interpreting the output from `git clone --progress`
 * and turning that into a percentage value estimating the overall progress
 * of the clone.
 */
export class CloneProgressParser extends GitProgressParser {
  public constructor() {
    super(steps)
  }
}
