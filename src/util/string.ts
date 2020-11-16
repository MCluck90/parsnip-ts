export const multiline = (
  strings: string | TemplateStringsArray,
  ...values: string[]
) => {
  const raw = typeof strings === 'string' ? [strings] : strings.raw;

  // Interpolation
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i]
      // Handle escaped backticks
      .replace(/\\`/g, '`');

    if (i < values.length) {
      result += values[i];
    }
  }

  const lines = result.split('\n');
  let minimumIndent = Infinity;
  for (const line of lines) {
    const match = line.match(/^(\s+)\S+/);
    if (match) {
      const indent = match[1].length;
      minimumIndent = Math.min(minimumIndent, indent);
    }
  }

  if (minimumIndent < Infinity) {
    result = lines
      .map((line) => (line[0] === ' ' ? line.slice(minimumIndent) : line))
      .join('\n');
  }

  return result.trim();
};
