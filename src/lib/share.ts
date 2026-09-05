/** Text copied by the Share button, e.g. "Raw Pdef: 2318.25 Raw Mdef: 1059.65". */

const plainNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, useGrouping: false });

export function formatShareText(rawPdef: number, rawMdef: number): string {
  return `Raw Pdef: ${plainNumber.format(rawPdef)} Raw Mdef: ${plainNumber.format(rawMdef)}`;
}

/** Copies `text` to the clipboard. Falls back to the legacy execCommand path (http, old browsers). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or document not focused: try the legacy path below.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
