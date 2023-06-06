export function dateToYMD(date: Date): string {

    if (!date) return "";
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${y}/${m.toString().padStart(2, "0")}`;
}