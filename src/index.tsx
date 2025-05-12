import { serve } from 'bun';
import { join } from 'path';

import index from './index.html';

const server = serve({
  routes: {
    // Serve static files from the public directory
    '/public/*': (req) => {
      const url = new URL(req.url);
      const filePath = join(process.cwd(), 'public', url.pathname.replace('/public/', ''));
      return new Response(Bun.file(filePath));
    },
    // Serve index.html for all unmatched routes.
    '/*': index,
  },
  development: process.env.NODE_ENV !== 'production',
});

console.log(`🚀 Server running at ${server.url}`);