const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'services');

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('import ') && !content.includes('export ')) return;

  // Convert imports
  content = content.replace(/import\s+(\*[\s\S]*?|\{[\s\S]*?\}|[\w$]+)\s+from\s+['"]([^'"]+)['"];?/g, (m, imp, mod) => {
    imp = imp.trim();
    if (imp.startsWith('* as ')) {
      const alias = imp.replace('* as ', '').trim();
      return `const ${alias} = require('${mod}');`;
    }
    return `const ${imp} = require('${mod}');`;
  });

  // Convert export statements
  const exportedFuncs = [];
  content = content.replace(/export\s+(async\s+function|function|const)\s+([\w$]+)/g, (m, type, name) => {
    exportedFuncs.push(name);
    return `${type} ${name}`;
  });

  if (exportedFuncs.length > 0) {
    content += `\nmodule.exports = { ${exportedFuncs.join(', ')} };\n`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed:', file, exportedFuncs);
});
