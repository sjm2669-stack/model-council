// Entrypoint for Deno Deploy: serves the built frontend from dist/ and the
// council debate API from /api/council, all on one origin.
// Zero external dependencies — Deno built-ins only.
//
// Local development:
//   npm run build && deno task serve
//   (or `npm run dev` with the vite proxy pointing at this server on :8000)

import { handleCouncil } from './council.ts'

// import.meta.url can resolve unpredictably in Deno Deploy's runtime;
// Deno.cwd() gives the actual working directory the process was started from.
const DIST_DIR = Deno.cwd() + '/dist'

console.log('[startup] import.meta.url:', import.meta.url)
console.log('[startup] Deno.cwd():', Deno.cwd())
console.log('[startup] DIST_DIR:', DIST_DIR)
try {
  const probe = await Deno.readFile(DIST_DIR + '/index.html')
  console.log('[startup] dist/index.html found, size:', probe.byteLength)
} catch (e) {
  console.log('[startup] dist/index.html NOT found:', (e as Error).message)
}

const CONTENT_TYPES: Record<string, string> = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'text/javascript; charset=utf-8',
  '.mjs':   'text/javascript; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.json':  'application/json',
  '.svg':   'image/svg+xml',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.webp':  'image/webp',
  '.ico':   'image/x-icon',
  '.txt':   'text/plain; charset=utf-8',
  '.map':   'application/json',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
}

function contentTypeFor(pathname: string): string {
  const dot = pathname.lastIndexOf('.')
  const ext = dot === -1 ? '' : pathname.slice(dot).toLowerCase()
  return CONTENT_TYPES[ext] ?? 'application/octet-stream'
}

async function serveStatic(pathname: string): Promise<Response | null> {
  // Strip the leading slash and reject path traversal
  const relative = pathname.replace(/^\/+/, '') || 'index.html'
  if (relative.split('/').includes('..')) return null

  const filePath = DIST_DIR + '/' + relative
  if (!filePath.startsWith(DIST_DIR + '/')) return null

  try {
    const file = await Deno.readFile(filePath)
    // Vite content-hashes everything under assets/ — cache those hard;
    // index.html must always revalidate so deploys take effect immediately
    const cacheControl = relative.startsWith('assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache'
    return new Response(file, {
      headers: {
        'Content-Type': contentTypeFor(relative),
        'Cache-Control': cacheControl,
      },
    })
  } catch {
    return null
  }
}

Deno.serve({ port: 8000 }, async (req: Request) => {
  const url = new URL(req.url)

  if (url.pathname === '/api/council') {
    return handleCouncil(req)
  }

  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405 })
  }

  const fileRes = await serveStatic(url.pathname)
  if (fileRes) return fileRes

  // SPA fallback: unknown extensionless paths get index.html
  if (!url.pathname.includes('.')) {
    const indexRes = await serveStatic('/index.html')
    if (indexRes) return indexRes
    return new Response('Frontend not built. Run: npm run build', { status: 500 })
  }

  return new Response('Not found', { status: 404 })
})
