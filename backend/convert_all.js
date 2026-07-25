const fs = require('fs');
const path = require('path');

function convertDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    if (file === 'node_modules') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      convertDirectory(fullPath);
    } else if (file.endsWith('.js') && file !== 'convert.js' && file !== 'check_requires.js' && file !== 'convert_all.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('import ') && !content.includes('export ')) return;

      // Convert imports
      content = content.replace(/import\s+(\*[\s\S]*?|\{[\s\S]*?\}|[\w$]+)\s+from\s+['"]([^'"]+)['"];?/g, (m, imp, mod) => {
        imp = imp.trim();
        if (imp.startsWith('{')) {
          return `const ${imp} = require('${mod}');`;
        } else if (imp.startsWith('* as ')) {
          const alias = imp.replace('* as ', '').trim();
          return `const ${alias} = require('${mod}');`;
        }
        return `const ${imp} = require('${mod}');`;
      });

      // Convert export default
      content = content.replace(/export\s+default\s+([a-zA-Z0-9_$]+);?/g, 'module.exports = $1;');

      // Convert export named functions / consts
      const exportedFuncs = [];
      content = content.replace(/export\s+(async\s+function|function|const)\s+([\w$]+)/g, (m, type, name) => {
        exportedFuncs.push(name);
        return `${type} ${name}`;
      });

      if (exportedFuncs.length > 0) {
        content += `\nmodule.exports = { ${exportedFuncs.join(', ')} };\n`;
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Processed:', fullPath);
    }
  });
}

convertDirectory(__dirname);
