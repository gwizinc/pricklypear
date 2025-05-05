import { serve } from 'bun';
import { readFile } from 'fs/promises';
import { join } from 'path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const server = serve({
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle CSS files
    if (path.endsWith('.css')) {
      try {
        const cssPath = join(process.cwd(), 'src', path);
        const css = await readFile(cssPath, 'utf-8');
        
        // Process CSS with PostCSS and Tailwind
        const result = await postcss([
          tailwindcss,
          autoprefixer
        ]).process(css, { from: cssPath });

        return new Response(result.css, {
          headers: { 'Content-Type': 'text/css' }
        });
      } catch (error) {
        console.error('Error processing CSS:', error);
        return new Response('Error processing CSS', { status: 500 });
      }
    }

    // Handle HTML and other files
    if (path === '/' || path === '/index.html') {
      const html = await readFile(join(process.cwd(), 'src/index.html'), 'utf-8');
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Handle other static files
    try {
      const filePath = join(process.cwd(), 'src', path);
      const file = await readFile(filePath);
      return new Response(file);
    } catch (error) {
      return new Response('Not Found', { status: 404 });
    }
  },
  development: process.env.NODE_ENV !== 'production',
});

console.log(`🚀 Server running at ${server.url}`); 