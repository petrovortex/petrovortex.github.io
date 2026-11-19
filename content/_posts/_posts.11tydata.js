import path from 'node:path';

export default {
  layout: 'post',
  section: 'blog',
  permalink: data => '/' + path.basename(data.page.inputPath, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '') + '/',
};
