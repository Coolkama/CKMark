import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = resolve(root, 'src/app.template.html');
const outputPath = resolve(root, 'index.html');
const checkOnly = process.argv.includes('--check');
const normaliseLineEndings = value => value.replace(/\r\n/g, '\n');

const modules = [
  ['MATHJAX_CONFIG', 'script', 'src/scripts/mathjax-config.js', ''],
  ['APP_STYLES', 'style', 'src/styles/app.css', ''],
  ['RIBBON_STYLES', 'style', 'src/styles/ribbon.css', 'id="sciwrix-ribbon-ui-styles"'],
  ['APP_SCRIPT', 'script', 'src/scripts/app.js', ''],
  ['COMPATIBILITY_SCRIPT', 'script', 'src/scripts/compatibility.js', ''],
  ['RIBBON_SCRIPT', 'script', 'src/scripts/ribbon.js', 'id="sciwrix-ribbon-ui-script"']
];

let output = await readFile(templatePath, 'utf8');
for (const [name, tag, relativePath, attributes] of modules) {
  const marker = `<!-- @inline:${name} -->`;
  const occurrences = output.split(marker).length - 1;
  if (occurrences !== 1) throw new Error(`Expected exactly one ${marker} marker, found ${occurrences}.`);
  const body = normaliseLineEndings(await readFile(resolve(root, relativePath), 'utf8')).replace(/\n?$/, '\n');
  const openingTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
  output = output.replace(marker, () => `${openingTag}\n${body}</${tag}>`);
}

if (/<!-- @inline:[A-Z_]+ -->/.test(output)) throw new Error('The generated document contains unresolved inline module markers.');
if (/<(?:script|link)\b[^>]+(?:src|href)=["']https?:\/\//i.test(output)) throw new Error('The generated document contains an external script or stylesheet dependency.');

const banner = '<!-- GENERATED FILE: edit src/ and run `npm run build`; do not edit index.html directly. -->';
output = output.replace(/^(<!doctype html>\r?\n)/i, `$1${banner}\n`);

if (checkOnly) {
  let existing;
  try { existing = await readFile(outputPath, 'utf8'); }
  catch { throw new Error('index.html is missing. Run `npm run build`.'); }
  const comparableExisting = normaliseLineEndings(existing);
  const comparableOutput = normaliseLineEndings(output);
  if (comparableExisting !== comparableOutput) {
    let firstDifference = 0;
    const sharedLength = Math.min(comparableExisting.length, comparableOutput.length);
    while (firstDifference < sharedLength && comparableExisting[firstDifference] === comparableOutput[firstDifference]) firstDifference++;
    const contextStart = Math.max(0, firstDifference - 60);
    const contextEnd = firstDifference + 60;
    console.error('Committed length:', comparableExisting.length, 'generated length:', comparableOutput.length, 'first difference:', firstDifference);
    console.error('Committed context:', JSON.stringify(comparableExisting.slice(contextStart, contextEnd)));
    console.error('Generated context:', JSON.stringify(comparableOutput.slice(contextStart, contextEnd)));
    throw new Error('index.html is out of date. Run `npm run build` and commit the result.');
  }
  console.log('Sciwrix standalone HTML is up to date.');
} else {
  await writeFile(outputPath, output, 'utf8');
  console.log(`Built ${outputPath}`);
}
