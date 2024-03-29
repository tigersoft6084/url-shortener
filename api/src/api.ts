import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { UrlStore } from './urlStore';
import { generateSlug, isValidUrl } from './utils';
import { rateLimiter } from './rate-limiter';

export async function initApp(
  urlDataFile: string
): Promise<express.Application> {
  const app = express();

  app
    .use(bodyParser.json())
    .use(
      cors({
        origin: (origin: string | undefined, callback) => {
          if (!origin) {
            return callback(null, true);
          }

          const allowed = [/http:\/\/localhost:*/i, /http:\/\/localhost/i];

          for (const pattern of allowed) {
            if (pattern.test(origin)) {
              return callback(null, true);
            }
          }

          callback(new Error('Not allowed by CORS'));
        },
      })
    )
    .use(express.static('public'))
    .use(rateLimiter());

  const urlStore = new UrlStore(urlDataFile);
  await urlStore.load();

  app.set('urlStore', urlStore);

  defineRoutes(app);

  return app;
}

function defineRoutes(app: express.Application) {
  app.post('/shorten', async (req, res) => {
    const urlStore = app.get('urlStore') as UrlStore;

    const { originalUrl } = req.body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    let slug: string;
    do {
      slug = generateSlug();
      // This enusres that the slug is unique.
      // In case of a normal database storage we would use a unique constraint.
      // In case of such a single threaded, single instance application, this is good enough.
    } while (urlStore.findUrlBySlug(slug));

    await urlStore.saveUrlEntry(slug, originalUrl);

    res.json({ originalUrl, shortUrl: `http://${req.headers.host}/${slug}` });
  });

  app.get('/:slug', async (req, res) => {
    const urlStore = app.get('urlStore') as UrlStore;

    const { slug } = req.params;
    const urlEntry = await urlStore.findUrlBySlug(slug);

    if (urlEntry) {
      return res.redirect(urlEntry.originalUrl);
    } else {
      return res.status(404).send('Not found');
    }
  });
}
