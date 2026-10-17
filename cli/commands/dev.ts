// kazeori dev: dev server を起動する。
import { createServer } from 'vite';
import { openWorkspace, prepareVite, viteConfigFile, type CommonOptions } from '../context.ts';

export interface DevOptions extends CommonOptions {
	port?: number;
	open?: boolean;
	host?: string;
}

export async function dev(options: DevOptions): Promise<number> {
	const ws = openWorkspace(options);
	prepareVite(ws, options);
	const server = await createServer({
		configFile: viteConfigFile,
		server: { port: options.port ?? 5173, open: options.open ?? false, host: options.host }
	});
	await server.listen();
	console.log(`workspace: ${ws.root}`);
	server.printUrls();
	// サーバーが止まるまで待つ
	await new Promise(() => {});
	return 0;
}
