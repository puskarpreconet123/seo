const test = require('node:test');
const assert = require('node:assert');
const { parseSeoElements } = require('../services/parser');

test('parseSeoElements - parses empty html correctly', (t) => {
  const result = parseSeoElements('', 'https://example.com');
  assert.strictEqual(result.title, null);
  assert.strictEqual(result.meta_description, null);
});

test('parseSeoElements - extracts title, meta description, and h1 headings', (t) => {
  const html = `
    <html>
      <head>
        <title>Great SEO Tool</title>
        <meta name="description" content="Optimize your search engine presence" />
      </head>
      <body>
        <h1>Main Header</h1>
        <h2>Secondary Header</h2>
      </body>
    </html>
  `;
  const result = parseSeoElements(html, 'https://example.com');
  assert.strictEqual(result.title, 'Great SEO Tool');
  assert.strictEqual(result.meta_description, 'Optimize your search engine presence');
  assert.deepStrictEqual(result.headings.h1, ['Main Header']);
  assert.deepStrictEqual(result.headings.h2, ['Secondary Header']);
});

test('parseSeoElements - handles relative URLs for links', (t) => {
  const html = `
    <html>
      <body>
        <a href="/about-us">About</a>
        <a href="https://google.com">Google</a>
      </body>
    </html>
  `;
  const result = parseSeoElements(html, 'https://example.com');
  // Check that the relative link has been resolved into an absolute internal link
  assert.ok(result.internal_links.includes('https://example.com/about-us'));
  assert.ok(result.external_links.includes('https://google.com/'));
});
