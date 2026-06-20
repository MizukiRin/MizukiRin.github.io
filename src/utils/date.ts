/**
 * 格式化日期为 YYYY-MM-DD
 * @param date 要格式化的日期对象
 * @returns 格式化后的字符串，例如 "2026-06-20"
 */
export function formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * 格式化日期为 YY-MM-DD (取年份后两位)
 * @param date 要格式化的日期对象
 * @returns 格式化后的字符串，例如 "26-06-20"
 */
export function formatDateYY(date: Date): string {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}
