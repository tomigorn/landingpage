# Homelab landing page

A clean, mobile-first landing page for the homelab. Lists the web UI of every container
and switches links between **Home** (direct LAN) and **Away** (public / VPN) with a manual
toggle. Static HTML/CSS/JS served by nginx, routed by Traefik. Runs alongside Dashy.

Design notes: [`docs/2026-05-29-homelab-landing-page-design.md`](docs/2026-05-29-homelab-landing-page-design.md)

## How it works

- **Home mode** (purple) — every service links to its LAN URL (`http://fastpi.homelab:PORT`).
- **Away mode** (orange) — services with a public domain become a green **public** link;
  internal-only services keep their LAN link but show a **🔒 VPN** tag (open once WireGuard
  is connected). The whole background recolors so the mode is obvious. Choice is remembered
  in the browser (`localStorage`).

## Access

| URL | Scope | Needs |
|-----|-------|-------|
| `http://home.fastpi.homelab` | LAN | AdGuard DNS (already routed via Traefik) |
| `https://home.holy-grail.ch`  | Anywhere | the Cloudflare tunnel step below |

## Editing the service list

Everything lives in [`site/services.js`](site/services.js). To add a container, copy a
line in `SERVICES` and fill in `name`, `icon` (emoji or image URL), `category`, `lan`, and
optionally `wan` (public URL) / `note`. No rebuild needed — nginx serves the file with
`no-cache`, so just refresh the page.

## Deploy / update

```bash
cd /home/pi/landingpage
docker compose up -d        # start / recreate
docker compose restart      # after editing nginx config
# editing files under site/ needs no restart — just refresh the browser
```

The Traefik route lives at
`/home/pi/Projects/Docker/Traefik/traefik/dynamic/home.yml` (Traefik watches the folder and
reloads automatically).

## ⚠️ One manual step for public access (`home.holy-grail.ch`)

The Cloudflare tunnel is configured in the Cloudflare dashboard (token-based), so it can't
be edited from the Pi. Mirror what already exists for `dashy.holy-grail.ch`:

1. **Cloudflare Zero Trust → Networks → Tunnels → your tunnel → Public Hostname → Add:**
   - Subdomain: `home`, Domain: `holy-grail.ch`
   - Service: same target as the `dashy` entry (e.g. `https://traefik` / the LAN host on 443),
     with the same TLS / no-TLS-verify settings.
2. Cloudflare adds the DNS record automatically. Traefik already has the router and will
   request the certificate on first request.

Until that's done, use the LAN URLs above.

## Bitwarden URL — confirm

`site/services.js` has a placeholder public URL for Bitwarden
(`https://bitwarden.holy-grail.ch`). Update it to the real Vaultwarden hostname configured
in your Cloudflare tunnel.

## Retiring Dashy

When happy, stop the old dashboard:

```bash
cd /home/pi/Projects/Docker/Dashy && docker compose down
```

(Its public route `dashy.holy-grail.ch` and config are left untouched in case you want it back.)
