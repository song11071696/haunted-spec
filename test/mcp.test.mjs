// Spawns the stdio MCP server and speaks raw JSON-RPC to it (no SDK needed).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function session(messages) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [join(root, 'bin/haunt-mcp.mjs')], { cwd: root });
    let out = '';
    const want = messages.filter((m) => m.id !== undefined).length;
    p.stdout.on('data', (d) => {
      out += d;
      const lines = out.split('\n').filter(Boolean);
      if (lines.length >= want) { p.kill(); resolve(lines.map((l) => JSON.parse(l))); }
    });
    p.on('error', reject);
    setTimeout(() => { p.kill(); reject(new Error(`timeout, got: ${out}`)); }, 5000);
    for (const m of messages) p.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', ...m })}\n`);
  });
}

test('MCP: initialize, list tools, analyze, exorcise, errors', async () => {
  const [init, list, an, ex, bad, unknown] = await session([
    { id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } } },
    { method: 'notifications/initialized' },
    { id: 2, method: 'tools/list' },
    { id: 3, method: 'tools/call', params: { name: 'analyze', arguments: { text: 'The page should load fast.' } } },
    { id: 4, method: 'tools/call', params: { name: 'exorcise', arguments: { text: 'The page should load fast.' } } },
    { id: 5, method: 'tools/call', params: { name: 'analyze', arguments: {} } },
    { id: 6, method: 'nope' },
  ]);
  assert.equal(init.result.protocolVersion, '2025-06-18');
  assert.equal(init.result.serverInfo.name, 'haunted-spec');
  assert.deepEqual(list.result.tools.map((t) => t.name), ['analyze', 'exorcise']);
  assert.deepEqual(an.result.structuredContent.findings.map((f) => f.rule), ['wraith-of-weak-will', 'specter-of-vagueness']);
  assert.equal(ex.result.structuredContent.scoreAfter, 0);
  assert.match(ex.result.structuredContent.text, /SHALL load ‹measurable/);
  assert.equal(bad.result.isError, true);
  assert.equal(unknown.error.code, -32601);
});

test('MCP: analyze by path reads the repo spec', async () => {
  const [, r] = await session([
    { id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05' } },
    { id: 2, method: 'tools/call', params: { name: 'analyze', arguments: { path: '.kiro/specs/haunted-spec/requirements.md' } } },
  ]);
  assert.equal(r.result.structuredContent.band, 'Purified');
});
