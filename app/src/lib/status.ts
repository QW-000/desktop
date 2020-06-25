import {
  AppFileStatusKind,
  AppFileStatus,
  ConflictedFileStatus,
  WorkingDirectoryStatus,
  isConflictWithMarkers,
  GitStatusEntry,
  isConflictedFileStatus,
  WorkingDirectoryFileChange,
} from '../models/status'
import { assertNever } from './fatal-error'
import {
  ManualConflictResolution,
  ManualConflictResolutionKind,
} from '../models/manual-conflict-resolution'

/**
 * Convert a given `AppFileStatusKind` value to a human-readable string to be
 * presented to users which describes the state of a file.
 *
 * Typically this will be the same value as that of the enum key.
 *
 * Used in file lists.
 */
export function mapStatus(status: AppFileStatus): string {
  switch (status.kind) {
    case AppFileStatusKind.New:
    case AppFileStatusKind.Untracked:
      return 'New 新增'
    case AppFileStatusKind.Modified:
      return 'Modified 修改'
    case AppFileStatusKind.Deleted:
      return 'Deleted 刪除'
    case AppFileStatusKind.Renamed:
      return 'Renamed 重新命名'
    case AppFileStatusKind.Conflicted:
      if (isConflictWithMarkers(status)) {
        const conflictsCount = status.conflictMarkerCount
        return conflictsCount > 0 ? 'Conflicted 衝突' : 'Resolved 解決'
      }

      return 'Conflicted 衝突'
    case AppFileStatusKind.Copied:
      return 'Copied 複製'
    default:
      return assertNever(status, `未知的檔案狀態 ${status}`)
  }
}

/** Typechecker helper to identify conflicted files */
export function isConflictedFile(
  file: AppFileStatus
): file is ConflictedFileStatus {
  return file.kind === AppFileStatusKind.Conflicted
}

/**
 * Returns a value indicating whether any of the files in the
 * working directory is in a conflicted state. See `isConflictedFile`
 * for the definition of a conflicted file.
 */
export function hasConflictedFiles(
  workingDirectoryStatus: WorkingDirectoryStatus
): boolean {
  return workingDirectoryStatus.files.some(f => isConflictedFile(f.status))
}

/**
 * Determine if we have any conflict markers or if its been resolved manually
 */
export function hasUnresolvedConflicts(
  status: ConflictedFileStatus,
  manualResolution?: ManualConflictResolution
) {
  // if there's a manual resolution, the file does not have unresolved conflicts
  if (manualResolution !== undefined) {
    return false
  }

  if (isConflictWithMarkers(status)) {
    // text file may have conflict markers present
    return status.conflictMarkerCount > 0
  }

  // binary file doesn't contain markers
  return true
}

/** the possible git status entries for a manually conflicted file status
 * only intended for use in this file, but could evolve into an official type someday
 */
type UnmergedStatusEntry =
  | GitStatusEntry.Added
  | GitStatusEntry.UpdatedButUnmerged
  | GitStatusEntry.Deleted

/** Returns a human-readable description for a chosen version of a file
 *  intended for use with manually resolved merge conficts
 */
export function getUnmergedStatusEntryDescription(
  entry: UnmergedStatusEntry,
  branch?: string
): string {
  const suffix = branch ? ` 從 ${branch}` : ''

  switch (entry) {
    case GitStatusEntry.Added:
      return `使用增加的檔案 ${suffix}`
    case GitStatusEntry.UpdatedButUnmerged:
      return `使用修改後的檔案 ${suffix}`
    case GitStatusEntry.Deleted:
      return `使用已刪除的檔案 ${suffix}`
    default:
      return assertNever(entry, '未知狀態的項目格式')
  }
}

/** Returns a human-readable description for an available manual resolution method
 *  intended for use with manually resolved merge conficts
 */
export function getLabelForManualResolutionOption(
  entry: UnmergedStatusEntry,
  branch?: string
): string {
  const suffix = branch ? ` 從 ${branch}` : ''

  switch (entry) {
    case GitStatusEntry.Added:
      return `使用增加的檔案 ${suffix}`
    case GitStatusEntry.UpdatedButUnmerged:
      return `使用修改後的檔案 ${suffix}`
    case GitStatusEntry.Deleted:
      return `使用已刪除的檔案 ${suffix}`
    default:
      return assertNever(entry, '未知狀態的項目格式')
  }
}

/** Filter working directory changes for conflicted or resolved files  */
export function getUnmergedFiles(status: WorkingDirectoryStatus) {
  return status.files.filter(f => isConflictedFile(f.status))
}

/** Filter working directory changes for untracked files  */
export function getUntrackedFiles(
  workingDirectoryStatus: WorkingDirectoryStatus
): ReadonlyArray<WorkingDirectoryFileChange> {
  return workingDirectoryStatus.files.filter(
    file => file.status.kind === AppFileStatusKind.Untracked
  )
}

/** Filter working directory changes for resolved files  */
export function getResolvedFiles(
  status: WorkingDirectoryStatus,
  manualResolutions: Map<string, ManualConflictResolutionKind>
) {
  return status.files.filter(
    f =>
      isConflictedFileStatus(f.status) &&
      !hasUnresolvedConflicts(f.status, manualResolutions.get(f.path))
  )
}

/** Filter working directory changes for conflicted files  */
export function getConflictedFiles(
  status: WorkingDirectoryStatus,
  manualResolutions: Map<string, ManualConflictResolutionKind>
) {
  return status.files.filter(
    f =>
      isConflictedFileStatus(f.status) &&
      hasUnresolvedConflicts(f.status, manualResolutions.get(f.path))
  )
}
