export function serializeCsv(headers, rows) {
  const escapeCell = (value) => {
    const text = value == null ? '' : String(value);
    const escaped = text.replaceAll('"', '""');
    return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  return [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ].join('\n');
}

export function downloadFile({ content, filename, mimeType = 'text/plain;charset=utf-8' }) {
  if (!content || !filename) {
    return;
  }

  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
