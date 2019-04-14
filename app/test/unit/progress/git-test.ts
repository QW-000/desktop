import {
  GitProgressParser,
  IGitProgress,
  IGitProgressInfo,
} from '../../../src/lib/progress'
import { parse } from '../../../src/lib/progress/git'

describe('GitProgressParser', () => {
  it('requires at least one step', () => {
    expect(() => new GitProgressParser([])).toThrow()
  })

  it('parses progress with one step', () => {
    const parser = new GitProgressParser([
      { title: '遠端: 壓縮項目', weight: 1 },
    ])

    expect(
      parser.parse('遠端: 壓縮項目:  72% (16/22)')
    ).toHaveProperty('percent', 16 / 22)
  })

  it('parses progress with several steps', () => {
    const parser = new GitProgressParser([
      { title: '遠端: 壓縮項目', weight: 0.5 },
      { title: '接收項目', weight: 0.5 },
    ])

    let result

    result = parser.parse('遠端: 壓縮項目:  72% (16/22)')

    expect(result.kind).toBe('progress')
    expect((result as IGitProgress).percent).toBe(16 / 22 / 2)

    result = parser.parse(
      '接收項目:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s'
    )

    expect(result.kind).toBe('progress')
    expect((result as IGitProgress).percent).toBe(0.5 + 166741 / 167587 / 2)
  })

  it('enforces ordering of steps', () => {
    const parser = new GitProgressParser([
      { title: '遠端: 壓縮項目', weight: 0.5 },
      { title: '接收項目', weight: 0.5 },
    ])

    let result

    result = parser.parse('遠端: 壓縮項目:  72% (16/22)')

    expect(result.kind).toBe('progress')
    expect((result as IGitProgress).percent).toBe(16 / 22 / 2)

    result = parser.parse(
      '接收項目:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s'
    )

    expect(result.kind).toBe('progress')
    expect((result as IGitProgress).percent).toBe(0.5 + 166741 / 167587 / 2)

    result = parser.parse('遠端: 壓縮項目:  72% (16/22)')

    expect(result.kind).toBe('context')
  })

  it('parses progress with no total', () => {
    const result = parse('遠端: 項目統計: 167587')

    expect(result).toEqual({
      title: '遠端: 項目統計',
      text: '遠端: 項目統計: 167587',
      value: 167587,
      done: false,
      percent: undefined,
      total: undefined,
    } as IGitProgressInfo)
  })

  it('parses final progress with no total', () => {
    const result = parse('遠端: 項目統計: 167587, 完成。')

    expect(result).toEqual({
      title: '遠端: 項目統計',
      text: '遠端: 項目統計: 167587, 完成。',
      value: 167587,
      done: true,
      percent: undefined,
      total: undefined,
    } as IGitProgressInfo)
  })

  it('parses progress with total', () => {
    const result = parse('遠端: 壓縮項目:  72% (16/22)')

    expect(result).toEqual({
      title: '遠端: 壓縮項目',
      text: '遠端: 壓縮項目:  72% (16/22)',
      value: 16,
      done: false,
      percent: 72,
      total: 22,
    } as IGitProgressInfo)
  })

  it('parses final with total', () => {
    const result = parse('遠端: 壓縮項目: 100% (22/22), 完成。')

    expect(result).toEqual({
      title: '遠端: 壓縮項目',
      text: '遠端: 壓縮項目: 100% (22/22), 完成。',
      value: 22,
      done: true,
      percent: 100,
      total: 22,
    } as IGitProgressInfo)
  })

  it('parses with total and throughput', () => {
    const result = parse(
      '接收項目:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s'
    )

    expect(result).toEqual({
      title: '接收項目',
      text: '接收項目:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s',
      value: 166741,
      done: false,
      percent: 99,
      total: 167587,
    } as IGitProgressInfo)
  })

  it('parses final with total and throughput', () => {
    const result = parse(
      '接收項目: 100% (167587/167587), 279.67 MiB | 2.43 MiB/s, 完成。'
    )

    expect(result).toEqual({
      title: '接收項目',
      text:
        '接收項目: 100% (167587/167587), 279.67 MiB | 2.43 MiB/s, 完成。',
      value: 167587,
      done: true,
      percent: 100,
      total: 167587,
    } as IGitProgressInfo)
  })

  it("does not parse things that aren't progress", () => {
    const result = parse(
      '遠端: 共計 167587 (增量 19), 重用 11 (增量 11), 包重用 167554         '
    )
    expect(result).toBeNull()
  })
})
