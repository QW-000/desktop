import {
  AppFileStatusKind,
  AppFileStatus,
  ConflictedFileStatus,
  WorkingDirectoryStatus,
} from '../models/status'
import { assertNever } from './fatal-error'

/**
 * Convert a given `AppFileStatusKind` value to a human-readable string to be
 * presented to users which describes the state of a file.
 *
 * Typically this will be the same value as that of the enum key.
 *
 * Used in file lists.
 */
export function mapStatus(status: AppFileStatusKind): string {
  switch (status) {
    case AppFileStatusKind.New:
      return 'New'
    case AppFileStatusKind.Modified:
      return 'Modified'
    case AppFileStatusKind.Deleted:
      return 'Deleted'
    case AppFileStatusKind.Renamed:
      return 'Renamed'
    case AppFileStatusKind.Conflicted:
      return 'Conflicted'
    case AppFileStatusKind.Copied:
      return 'Copied'
  }

  return assertNever(status, `Unknown file status ${status}`)
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
