const fs = require('fs');
const path = require('path');

let brokenCount = 0;

function checkDir(currentDir) {
  fs.readdirSync(currentDir).forEach(file => {
    if (file === 'node_modules') return;
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkDir(fullPath);
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const regex = /require\(['"](\.[^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const reqPath = match[1];
        const resolved = path.resolve(path.dirname(fullPath), reqPath);
        const exists = fs.existsSync(resolved) || fs.existsSync(resolved + '.js') || fs.existsSync(resolved + '/index.js');
        if (!exists) {
          console.error('Broken require in file:', fullPath);
          console.error('  -> Path:', reqPath);
          brokenCount++;
        }
      }
    }
  });
}

checkDir(__dirname);

if (brokenCount > 0) {
  console.error(`\nValidation failed: ${brokenCount} broken require(s) found.`);
  process.exit(1);
} else {
  console.log('\nAll require statements are valid.');
  process.exit(0);
}

