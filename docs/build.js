#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```/g, '').trim();
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code>${escaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Lists
  html = html.replace(/<p>- (.*?)<\/p>/g, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)/s, (match) => `<ul>${match}</ul>`);

  return html;
}

function generateNav(files) {
  const nav = {
    'Getting Started': [
      { title: 'Installation', file: 'installation' },
      { title: 'Configuration', file: 'configuration' },
      { title: 'CLI Shell', file: 'shell' }
    ],
    'Guides': [
      { title: 'SDK Integration', file: 'sdk-integration' },
      { title: 'Tools & Hooks', file: 'tools-and-hooks' },
      { title: 'Marketplace', file: 'marketplace' },
      { title: 'Upstream Inheritance', file: 'upstream-inheritance' },
      { title: 'Feature Migration', file: 'feature-migration' }
    ],
    'Reference': [
      { title: 'Architecture Overview', file: '../architecture/overview' },
      { title: 'API Reference', file: '../api/quick-reference' }
    ]
  };
  return nav;
}

async function build() {
  const guideDir = path.join(__dirname, 'guide');
  const distDir = path.join(__dirname, 'dist');
  const templatePath = path.join(__dirname, 'template.html');

  // Create dist directory
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Read template
  let template = fs.readFileSync(templatePath, 'utf-8');

  // Get all markdown files
  const files = fs.readdirSync(guideDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  const nav = generateNav(files);

  // Process each markdown file
  for (const file of files) {
    const mdPath = path.join(guideDir, `${file}.md`);
    const htmlPath = path.join(distDir, `${file}.html`);

    const markdown = fs.readFileSync(mdPath, 'utf-8');
    const content = markdownToHtml(markdown);

    // Build navigation HTML
    let navHtml = '<nav class="sidebar">\n';
    for (const [section, items] of Object.entries(nav)) {
      navHtml += `<h4>${section}</h4>\n<ul>\n`;
      for (const item of items) {
        const href = item.file.startsWith('../') 
          ? item.file + '.html' 
          : item.file + '.html';
        const isActive = item.file === file ? ' class="active"' : '';
        navHtml += `<li><a href="${href}"${isActive}>${item.title}</a></li>\n`;
      }
      navHtml += '</ul>\n';
    }
    navHtml += '</nav>';

    const html = template
      .replace('{{CONTENT}}', content)
      .replace('{{NAV}}', navHtml);

    fs.writeFileSync(htmlPath, html);
    console.log(`✓ Generated ${file}.html`);
  }

  console.log(`\n✅ Docs site generated in ${distDir}`);
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
