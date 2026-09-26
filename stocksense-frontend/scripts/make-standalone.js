import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const htmlPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(f => f.endsWith('.js'));
  const cssFile = files.find(f => f.endsWith('.css'));

  let jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  let cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

  // Prevent closing script tag issue in JS string literals
  jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');

  let standalone = html;
  standalone = standalone.replace(/<link rel="stylesheet"[^>]+>/, `<style>\n${cssContent}\n</style>`);
  standalone = standalone.replace(/<script type="module"[^>]+><\/script>/, `<script type="module">\n${jsContent}\n</script>`);

  const outPath = path.join(distDir, 'StockSense-App.html');
  fs.writeFileSync(outPath, standalone, 'utf8');
  console.log(`Created standalone single-file app: ${outPath} (${(standalone.length / 1024).toFixed(1)} KB)`);

  // Also copy to root of project so double-clicking is trivial
  fs.writeFileSync(path.resolve('StockSense-App.html'), standalone, 'utf8');
}
