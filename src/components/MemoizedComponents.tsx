import React from 'react'
import { PageHeader, PageSkeleton, ErrorState, EmptyState } from './PageStates'

export const MemoPageHeader = React.memo(PageHeader)
MemoPageHeader.displayName = 'MemoPageHeader'

export const MemoPageSkeleton = React.memo(PageSkeleton)
MemoPageSkeleton.displayName = 'MemoPageSkeleton'

export const MemoErrorState = React.memo(ErrorState)
MemoErrorState.displayName = 'MemoErrorState'

export const MemoEmptyState = React.memo(EmptyState)
MemoEmptyState.displayName = 'MemoEmptyState'
