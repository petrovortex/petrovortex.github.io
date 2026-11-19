import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArguments, ensurePortAvailable } from '../../scripts/site.mjs';

test('preview accepts an explicit port and rejects ambiguous command options', () => {
  assert.deepEqual(parseArguments([]), { command: 'serve', port: 4000 });
  assert.deepEqual(parseArguments(['serve', '--port', '4001']), { command: 'serve', port: 4001 });
  for (const args of [['unknown'], ['build', '--port', '4001'], ['serve', '--port'], ['serve', '--port', '0'], ['serve', '--port', '65536'], ['serve', '--port', '1.5']]) {
    assert.throws(() => parseArguments(args));
  }
});

test('occupied preview port fails before preparing content and leaves the existing server alone', async () => {
  const server = net.createServer(socket => socket.end('existing preview'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    await assert.rejects(ensurePortAvailable(port), /already in use/);
    const launcher = fileURLToPath(new URL('../../scripts/site.mjs', import.meta.url));
    const result = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [launcher, 'serve', '--port', String(port)], {
        env: { ...process.env, SITE_PYTHON: 'missing-python-for-launcher-test' },
        stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
      });
      let output = '';
      child.stdout.on('data', chunk => { output += chunk; });
      child.stderr.on('data', chunk => { output += chunk; });
      child.on('error', reject);
      child.on('close', code => resolve({ code, output }));
    });
    assert.equal(result.code, 1);
    assert.match(result.output, /already in use/);
    assert.doesNotMatch(result.output, /Preparing|Download generation|PDF export/);
    const reply = await new Promise((resolve, reject) => {
      const socket = net.connect(port, '127.0.0.1');
      let response = '';
      socket.on('data', chunk => { response += chunk; });
      socket.on('end', () => resolve(response));
      socket.on('error', reject);
    });
    assert.equal(reply, 'existing preview');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
