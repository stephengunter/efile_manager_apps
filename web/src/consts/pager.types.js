export const PAGER_OPTIONS = (rows = [10,25,50]) => rows.map(row => ({value: row, title: `${row} 筆`}))

export const PER_PAGE_TEXT = '每頁'