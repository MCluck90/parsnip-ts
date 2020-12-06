import { copyFileSync } from 'fs';
import path from 'path';

const file = (filename: string): [string, string] => [
  path.join(__dirname, `../${filename}`),
  path.join(__dirname, `../dist/${filename}`),
];

const filesToCopy = ['.npmignore', 'LICENSE', 'package.json', 'README.md'];
for (const filename of filesToCopy) {
  copyFileSync(...file(filename));
}
