# Deployment

This is a static portfolio site. The public entry point is `index.html`.

## Live URLs

- GitHub: https://github.com/jasonclawc/jcoldren-work
- Vercel: https://jcoldren-work.vercel.app/
- Cloudflare Pages: https://jcoldren-work.pages.dev/
- Custom domain: https://jcoldren.work/

## GitHub

After signing in with GitHub CLI:

```sh
gh repo create jcoldren-work --public --source=. --remote=origin --push
```

## Vercel

After signing in with Vercel:

```sh
npm run deploy:vercel
```

## Cloudflare Pages

After signing in with Cloudflare:

```sh
npm run deploy:cloudflare
```

In Cloudflare Pages, add the custom domain:

```text
jcoldren.work
```

If Cloudflare is also your DNS provider for `jcoldren.work`, Pages can create the DNS records automatically. Otherwise, add the CNAME record Cloudflare provides.
