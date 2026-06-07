# Homelab Landing Page — Design

Date: 2026-05-29
Status: Approved, building

## Goal

Replace the cluttered Dashy dashboard with a cleaner, self-hosted landing page that
lists the web UIs of every container in the homelab, so links can be found without
remembering ports. It must work both on the LAN and remotely, switching link targets
accordingly.

Runs **alongside** Dashy on a new domain (`home.holy-grail.ch`) so the old one can be
compared and retired later.

## Networking model

- Host: `fastpi` at `192.168.1.2`. Internal services resolve via AdGuard DNS as
  `fastpi.homelab` (and a few special hosts like `wg-easy.fastpi.homelab`), routed by
  Traefik. Internal-only routes are IP-restricted to `192.168.1.0/24` + the VPN NAT range.
- Public services are exposed via Traefik on `*.holy-grail.ch` (Cloudflare) and
  `*.ddns.net`.
- WireGuard (`wg-easy`) gives remote access into the internal range, so "away on VPN"
  reaches the `fastpi.homelab:PORT` URLs too.

## Home vs Away (manual toggle)

A header toggle the user flips manually. **The whole page background recolors** so the
mode is unmistakable at a glance:

- **Home = purple background.** Every service links directly to its LAN URL
  (`http://fastpi.homelab:PORT`).
- **Away = orange background.** Services with a public domain turn into a green
  **PUBLIC** link (no VPN needed). Internal-only services keep their `fastpi.homelab:PORT`
  link but show an amber **🔒 VPN** tag (works once WireGuard is connected).

The selected mode persists in `localStorage`. Default on first load: Home.

## Layout & style

- **Compact list**, mobile-first: full-width rows that stack to one column on a phone and
  use the width on desktop. Grouped into category sections.
- Per-row: icon tile, name, short description, and on the right either the port/host
  (Home) or a PUBLIC/VPN tag (Away).
- Live filter box at the top filters rows by name as you type.
- Accent color: orange (action), on a purple page (Home) / orange page (Away).
- Dark theme. No build step — plain HTML/CSS/vanilla JS.

## Data model

Services live in a single editable `services.js` array. Each entry:

```js
{ name, desc, icon, category, lan, wan?, note? }
```

- `lan` — internal URL used in Home mode (and in Away mode if no `wan`, with a VPN tag).
- `wan` — optional public URL; when present, used in Away mode and tagged PUBLIC.
- `note` — optional hint (e.g. "basic auth").

Adding a future container = one entry in this array.

## Service inventory (web UIs only)

Infrastructure: Traefik (`:8080/dashboard/`, basic auth), Portainer (`:9443` https),
AdGuard Home (`:3000`), WireGuard / wg-easy (`wg-easy.fastpi.homelab:8080`).

Monitoring: Grafana (`:3001`), Prometheus (`:9090`), InfluxDB (`:8086`).

Media & Downloads: Audiobookshelf (public `audiobookshelf.holy-grail.ch`),
qBittorrent (`:8085`), SABnzbd (`:8090`), Mousehole (`:5010`), Port Updater (`:8087`).

Apps: WG-Chores (`:8084` / public `wg-aemtli.ddns.net`), WG-Chores SQLiteWeb (`:8088`),
Bitwarden (public domain — to confirm), SBB EasyRide Tax Report (`:8083`),
Backdrop Carousel (public `backdrop-carousel.holy-grail.ch`).

Dev & Data: Jenkins (`:8081`), pgweb / Digitec (`:8089`), Digitec web (`:3002`),
CloudBeaver (`:8978`), Loyalty Cards backend (`:5000`), phpLDAPadmin (`:6443`).

(Excluded — no web UI: clamav, virustotal, telegraf, node-exporter, gluetun, cloudflared,
duckdns, noip, samba, autoheal, opennebula db/ldap, postgres, mariadb, backdrop-carousel
sync client. LanguageTool is an auth-protected API, not a human UI.)

## Deployment

- New project at `/landingpage`:
  - `site/` — static files (`index.html`, `styles.css`, `services.js`, `app.js`).
  - `docker-compose.yaml` — `nginx:alpine` serving `./site`, joined to the external
    `traefik_proxy` network, plus host port `8095` for immediate LAN access.
  - Traefik dynamic route added at
    `/home/pi/Projects/Docker/Traefik/traefik/dynamic/home.yml`:
    - `home.holy-grail.ch` on `websecure` (Cloudflare cert resolver) — public.
    - `home.fastpi.homelab` on `internal` — LAN.
- **Manual step (user, in Cloudflare dashboard):** add a tunnel public hostname
  `home.holy-grail.ch → https://traefik` (mirroring the existing `dashy.holy-grail.ch`
  entry) and its DNS record. Documented in the README. Everything else is automated.

## Out of scope (YAGNI)

- Live container health/status (the toggle and links are the point).
- Auth on the landing page itself (it only exposes links, no secrets; public routes
  inherit Traefik's secure-headers).
- Auto-detection of home/away (user chose a manual toggle).
