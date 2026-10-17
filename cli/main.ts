#!/usr/bin/env bun
// kazeori のコマンドラインインターフェース。
import { parseArgs } from 'node:util';
import { CliError, EXIT_DECK, EXIT_ENV } from './context.ts';

const help = `kazeori: カザモリスタイルのスライドを markdown から生成する

使い方:
  kazeori dev [--port <n>] [--open]               dev server を起動する
  kazeori build [--deck <id>...] [--out <dir>]    静的サイトをビルドする
  kazeori pdf (--deck <id>... | --year <yyyy> | --all) [--out <dir>] [--strict]
                                                  PDF を出力する
  kazeori check [--deck <id>...] [--json] [--verbose]
                                                  デッキを検査する
  kazeori list [--year <yyyy>] [--json]           デッキの一覧を表示する
  kazeori new <name> [--template <name>] [--date <yyyy-mm-dd>] [--title <text>] [--event <text>]
                                                  雛形からデッキを作る
  kazeori templates [--json]                      使える雛形の一覧を表示する

共通のオプション:
  --workspace <dir>   kazeori.yaml を探し始めるディレクトリ（省略時はカレントディレクトリ）
  --brand <file>      ブランド設定（社名、copyright、ロゴ）を上書きする YAML
  -h, --help          このヘルプを表示する

終了コード:
  0  成功
  1  デッキの不備（check のエラー、未知のデッキや雛形、--strict での文字のはみ出し）
  2  実行環境の問題（Chromium がない、ポートが使えないなど）
`;

const options = {
	workspace: { type: 'string' },
	brand: { type: 'string' },
	deck: { type: 'string', multiple: true },
	out: { type: 'string' },
	year: { type: 'string' },
	all: { type: 'boolean' },
	strict: { type: 'boolean' },
	json: { type: 'boolean' },
	verbose: { type: 'boolean' },
	port: { type: 'string' },
	host: { type: 'string' },
	open: { type: 'boolean' },
	template: { type: 'string' },
	date: { type: 'string' },
	title: { type: 'string' },
	event: { type: 'string' },
	help: { type: 'boolean', short: 'h' }
} as const;

async function run(argv: string[]): Promise<number> {
	let parsed;
	try {
		parsed = parseArgs({ args: argv, options, allowPositionals: true });
	} catch (e) {
		throw new CliError(`${(e as Error).message}\n\n${help}`);
	}
	const { values, positionals } = parsed;
	const [command, ...rest] = positionals;
	if (values.help || !command) {
		console.log(help);
		return 0;
	}
	const common = { workspace: values.workspace, brand: values.brand };

	switch (command) {
		case 'dev': {
			const { dev } = await import('./commands/dev.ts');
			const port = values.port ? Number(values.port) : undefined;
			if (port !== undefined && !Number.isInteger(port))
				throw new CliError('--port は整数で指定してください');
			return dev({ ...common, port, open: values.open, host: values.host });
		}
		case 'build': {
			const { build } = await import('./commands/build.ts');
			return build({ ...common, deck: values.deck, out: values.out });
		}
		case 'pdf': {
			const { pdf } = await import('./commands/pdf.ts');
			return pdf({
				...common,
				deck: values.deck,
				year: values.year,
				all: values.all,
				out: values.out,
				strict: values.strict
			});
		}
		case 'check': {
			const { check } = await import('./commands/check.ts');
			return check({ ...common, deck: values.deck, json: values.json, verbose: values.verbose });
		}
		case 'list': {
			const { list } = await import('./commands/list.ts');
			return list({ ...common, year: values.year, json: values.json });
		}
		case 'new': {
			const { newDeck } = await import('./commands/templates.ts');
			return newDeck(rest[0], {
				...common,
				template: values.template,
				date: values.date,
				title: values.title,
				event: values.event
			});
		}
		case 'templates': {
			const { templates } = await import('./commands/templates.ts');
			return templates({ ...common, json: values.json });
		}
		default:
			throw new CliError(`未知のコマンド「${command}」です\n\n${help}`);
	}
}

try {
	process.exitCode = await run(process.argv.slice(2));
} catch (e) {
	if (e instanceof CliError) {
		console.error(`kazeori: ${e.message}`);
		process.exitCode = e.code;
	} else {
		const err = e as NodeJS.ErrnoException;
		if (err?.code === 'EADDRINUSE') {
			console.error(`kazeori: ポートが使用中です: ${err.message}`);
			process.exitCode = EXIT_ENV;
		} else {
			console.error(e);
			process.exitCode = EXIT_DECK;
		}
	}
}
