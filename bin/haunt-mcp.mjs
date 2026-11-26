#!/usr/bin/env node
/**
 * haunt-mcp - a minimal Model Context Protocol server (stdio, JSON-RPC 2.0) for Haunted Spec.
 *
 * Exposes the same pure core as the web app and the CLI, so Kiro (or any MCP client) can lint
 * a spec while writing it:
 *   analyze   -> haunt score, band, and every ghost (line, rule, matched words, suggested fix)
 *   exorcise  -> the deterministic auto-fixed text (or a Kiro-format requirements.md)
 *
 * Zero dependencies: newline-delimited JSON-RPC on stdin/stdout, logs on stderr only.
 *   node bin/haunt-mcp.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { analyze, exorciseAll, toKiroRequirements, GHOST_BY_ID } from '../src/core/index.mjs';

const SERVER = { name: 'haunted-spec', version: '1.1.0' };
const SUPPORTED = ['2025-06-18', '2025-03-26', '2024-11-05'];
const MAX_CHARS = 500_000;

const INPUT = {
  type: 'object',
  properties: {
    text: { type: 'string', description: 'Requirements / spec markdown to check.' },
    path: { type: 'string', description: 'Or: path to a markdown file (relative to the server working directory), e.g. .kiro/specs/my-feature/requirements.md' },
  },
  additionalProperties: false,
};

const TOOLS = [
  {
    name: 'analyze',
    title: 'Haunted Spec: find ambiguous requirements',
    description: 'Lint requirements text for vague, weak, untestable or compound wording (7 rule types) and EARS shape. ' +
      'Returns the haunt score (0 = clean, 100 = cursed), its band, and every finding with line number, rule, matched words and a suggested rewrite. ' +
      'Rule-based and English-only: it matches words, not meaning.',
    inputSchema: INPUT,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'exorcise',
    title: 'Haunted Spec: auto-fix requirements',
    description: 'Apply every deterministic fix (SHALL instead of should, ‹placeholders› for numbers a human must choose, split compound requirements) ' +
      'and return the fixed text with before/after scores. format "kiro" returns a Kiro-format requirements.md (user stories + EARS criteria). ' +
      'Placeholders like ‹measurable: within 2 s at p95› are suggestions: a person must confirm the real value.',
    inputSchema: {
      ...INPUT,
      properties: { ...INPUT.properties, format: { type: 'string', enum: ['text', 'kiro'], description: 'text (default) or kiro' } },
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
];

function getText(args = {}) {
  if (typeof args.text === 'string' && typeof args.path === 'string') throw new Error('Pass either "text" or "path", not both.');
  let text = args.text;
  if (typeof args.path === 'string') text = readFileSync(resolve(process.cwd(), args.path), 'utf8');
  if (typeof text !== 'string') throw new Error('Missing "text" (or "path").');
  if (text.length > MAX_CHARS) throw new Error(`Input is larger than ${MAX_CHARS} characters.`);
  return text;
}

function report(text) {
  const r = analyze(text);
  return {
    score: r.score,
    band: r.band,
    requirementLines: r.stats.requirementLines,
    hauntedLines: r.stats.hauntedLines,
    byGhost: Object.fromEntries(Object.entries(r.stats.byGhost).filter(([, n]) => n > 0)),
    findings: r.findings.map((f) => ({
      line: f.lineIndex + 1,
      column: f.start + 1,
      ghost: GHOST_BY_ID[f.ghostId].name,
      rule: f.ghostId,
      match: f.match.trim(),
      why: GHOST_BY_ID[f.ghostId].why,
      suggestion: f.suggestion,
    })),
  };
}

function callTool(name, args) {
  const text = getText(args);
  if (name === 'analyze') {
    const r = report(text);
    const head = `Haunt score ${r.score}/100 (${r.band}): ${r.findings.length} finding(s) on ${r.hauntedLines}/${r.requirementLines} requirement line(s).`;
    return { content: [{ type: 'text', text: `${head}\n${JSON.stringify(r, null, 2)}` }], structuredContent: r };
  }
  if (name === 'exorcise') {
    const before = analyze(text).score;
    const fixed = exorciseAll(text);
    const after = analyze(fixed).score;
    const out = args.format === 'kiro' ? toKiroRequirements(fixed) : fixed;
    return {
      content: [{ type: 'text', text: `Score ${before} -> ${after}. Review every ‹placeholder› before using this text.\n\n${out}` }],
      structuredContent: { scoreBefore: before, scoreAfter: after, format: args.format === 'kiro' ? 'kiro' : 'text', text: out },
    };
  }
  const e = new Error(`Unknown tool: ${name}`);
  e.code = -32602;
  throw e;
}

function handle(msg) {
  const { id, method, params } = msg;
  switch (method) {
    case 'initialize': {
      const asked = params?.protocolVersion;
      return {
        protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions: 'Call analyze on requirements text (or a .kiro/specs/*/requirements.md path) before implementing it; fix findings or confirm them with the user.',
      };
    }
    case 'ping': return {};
    case 'tools/list': return { tools: TOOLS };
    case 'tools/call': {
      try {
        return callTool(params?.name, params?.arguments ?? {});
      } catch (e) {
        if (e.code === -32602) throw e;
        return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
      }
    }
    default: {
      if (id === undefined) return undefined; // notification (e.g. notifications/initialized)
      const e = new Error(`Method not found: ${method}`);
      e.code = -32601;
      throw e;
    }
  }
}

const send = (obj) => process.stdout.write(`${JSON.stringify(obj)}\n`);

createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }
  try {
    const result = handle(msg);
    if (msg.id !== undefined && result !== undefined) send({ jsonrpc: '2.0', id: msg.id, result });
  } catch (e) {
    if (msg.id !== undefined) send({ jsonrpc: '2.0', id: msg.id, error: { code: e.code ?? -32603, message: e.message } });
  }
});
process.stderr.write(`haunted-spec MCP server ${SERVER.version} ready (stdio)\n`);
