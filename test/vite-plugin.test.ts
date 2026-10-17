import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { kazeoriSourceHash } from '../src/lib/workspace/vite-plugin.ts';

describe('kazeoriSourceHash（#11）', () => {
	function makeRoot() {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kazeori-hash-'));
		fs.mkdirSync(path.join(root, 'src/lib'), { recursive: true });
		fs.writeFileSync(path.join(root, 'package.json'), '{"version":"0.0.1"}');
		fs.writeFileSync(path.join(root, 'src/lib/a.svelte'), '<p>a</p>');
		return root;
	}

	test('同じ内容なら同じハッシュになる', () => {
		const root = makeRoot();
		try {
			expect(kazeoriSourceHash(root)).toBe(kazeoriSourceHash(root));
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	});

	test('ソースか package.json が変わるとハッシュが変わる', () => {
		const root = makeRoot();
		try {
			const before = kazeoriSourceHash(root);
			fs.writeFileSync(path.join(root, 'src/lib/a.svelte'), '<p>b</p>');
			const afterSource = kazeoriSourceHash(root);
			fs.writeFileSync(path.join(root, 'package.json'), '{"version":"0.0.2"}');
			const afterPackage = kazeoriSourceHash(root);
			expect(new Set([before, afterSource, afterPackage]).size).toBe(3);
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	});
});
