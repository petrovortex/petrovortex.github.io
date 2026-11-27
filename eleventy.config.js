import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';
import { renderMarkdown } from './scripts/content/render-markdown.mjs';
import { validateContent } from './scripts/site/validate-content.mjs';
import { registerFilters } from './scripts/site/template-filters.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));

export default async function (config) {
  const settings = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
  const content = (settings.collections_dir || 'content').replaceAll('\\', '/');
  config.addDataExtension('yml,yaml', source => parse(source));
  config.setFrontMatterParsingOptions({
    excerpt_alias: 'excerpt',
    excerpt(file, options) {
      const source = String(options.filePath || '').replaceAll('\\', '/').replace(/^\.\//, '');
      if (source.startsWith(content + '/_posts/') && !file.data.excerpt) {
        file.excerpt = renderMarkdown(file.content.trim().split(/\r?\n\s*\r?\n/)[0] || '');
      }
    },
  });
  config.addGlobalData('site', () => ({
    ...settings, time: new Date(),
    engagement_mode: process.env.SITE_PREVIEW === '1' || process.env.ELEVENTY_RUN_MODE === 'serve' ? 'preview' : settings.engagement_mode || 'auto',
  }));
  config.setNunjucksEnvironmentOptions({ autoescape: true });
  config.addExtension('xml', { key: 'njk' });
  config.setLibrary('md', { render: (source, data = {}) => renderMarkdown(source, Boolean(data.math), data.lang || 'en', data.collect_references === true) });
  registerFilters(config, settings);
  config.addPreprocessor('publication-state', '*', data => {
    if (data.published === false || (data.date && new Date(data.date).getTime() > Date.now())) return false;
  });

  for (const name of ['posts', 'notebooks', 'notes']) {
    config.addCollection(name, api => api.getFilteredByGlob(`${content}/_${name}/**/*.md`));
  }
  config.addCollection('pages', api => api.getFilteredByGlob('pages/**/*.{html,njk,xml}'));
  for (const ignored of ['README.md', 'docs/**', 'scripts/**', 'config/**', 'tests/**', 'vendor/**', 'node_modules/**', '.preview/**', '.github/**', 'assets/**']) config.ignores.add(ignored);
  config.addPassthroughCopy('assets');
  config.ignores.add('resume/archive/**');
  config.ignores.add('resume/*.{md,html,njk,xml}');
  config.addPassthroughCopy('resume/cv.pdf');
  config.addWatchTarget('_config.yml');
  config.addWatchTarget('assets/images/');
  config.addWatchTarget('assets/imported/');
  config.watchIgnores.add('_data/downloads.json');
  config.watchIgnores.add('_data/social_images.json');
  config.watchIgnores.add('assets/downloads/**');
  config.watchIgnores.add('assets/images/social/**');
  config.on('eleventy.before', async () => {
    await validateContent(root);
    execFileSync(process.execPath, [path.join(root, 'scripts/content.mjs'), '--exports-only', '--web-only'], { cwd: root, stdio: 'inherit' });
  });
  return {
    dir: { input: '.', output: '_site', includes: '_includes', layouts: '_layouts', data: '_data' },
    templateFormats: ['md', 'html', 'njk', 'xml'],
    htmlTemplateEngine: 'njk', markdownTemplateEngine: false,
  };
}
