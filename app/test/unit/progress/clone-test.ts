import { CloneProgressParser } from '../../../src/lib/progress'

describe('CloneProgressParser', () => {
  describe('#parse', () => {
    let parser: CloneProgressParser = new CloneProgressParser()

    afterEach(() => {
      parser = new CloneProgressParser()
    })

    it('understands receiving object', () => {
      expect(
        parser.parse(
          '接收項目:  17% (4808/28282), 3.30 MiB | 1.29 MiB/s'
        )
      ).not.toBeNull()
    })

    it('understands resolving deltas', () => {
      expect(
        parser.parse('分析增量:  89% (18063/20263)')
      ).not.toBeNull()
    })

    it('understands checking out files', () => {
      expect(parser.parse('校對檔案: 100% (579/579)')).not.toBeNull()
    })

    it('understands remote compression', () => {
      expect(
        parser.parse('遠端: 壓縮項目:  45% (10/22)')
      ).not.toBeNull()
    })

    it('understands relative weights', () => {
      const compressing = parser.parse(
        '遠端: 壓縮項目:  45% (10/22)'
      )
      expect(compressing.kind).toBe('progress')
      expect(compressing.percent).toBeCloseTo((10 / 22) * 0.1, 0.01)

      const receiving = parser.parse(
        '接收項目:  17% (4808/28282), 3.30 MiB | 1.29 MiB/s'
      )
      expect(receiving.kind).toBe('progress')
      expect(receiving.percent).toBeCloseTo(0.1 + (4808 / 28282) * 0.6, 0.01)

      const resolving = parser.parse('分析增量:  89% (18063/20263)')
      expect(resolving.kind).toBe('progress')
      expect(resolving.percent).toBeCloseTo(0.7 + (18063 / 20263) * 0.1, 0.01)

      const checkingOut = parser.parse('校對檔案: 100% (579/579)')
      expect(checkingOut.kind).toBe('progress')
      expect(checkingOut.percent).toBeCloseTo(0.8 + (579 / 579) * 0.2, 0.01)
    })

    it('ignores wrong order', () => {
      const finalProgress = parser.parse('校對檔案: 100% (579/579)')
      const earlyProgress = parser.parse('接收項目:   1% (283/28282)')

      expect(earlyProgress.kind).toBe('context')
      expect(finalProgress.kind).toBe('progress')
    })

    it("ignores lines it doesn't understand", () => {
      expect(parser.parse('項目統計: 28282, 完成。').kind).toBe(
        'context'
      )
    })
  })
})
