/**
 * 格式化 RFC3339 时间为 YYYY-MM-DD（直接取日期部分，避免时区偏移）
 */
export function formatDate(iso: string): string {
  if (!iso) return ''
  const datePart = iso.split('T')[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : iso
}
