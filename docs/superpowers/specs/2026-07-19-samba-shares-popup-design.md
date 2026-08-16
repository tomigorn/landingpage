# Landing page: new services + Samba shares popup

Date: 2026-07-19

## Goal

Add five missing services to the homelab landing page. Four are ordinary links.
The fifth, Samba (mouse stack), is not a web service — it needs a popup listing
the SMB shares and how to connect, with **no passwords shown**.

## Scope

### Ordinary link tiles

| Service | Category | LAN | WAN |
|---|---|---|---|
| Loyalty Cards | Apps | `https://loyalty-cards.holy-grail.ch` | same |
| Stonks | Apps | `https://stonks.holy-grail.ch` | same |
| Claude Mockups | Dev & Data | `https://claude-mockups.holy-grail.ch` | same |
| Beefy Waker | Infrastructure | `https://beefy-wol.fastpi.homelab/` | — (LAN only) |

All four verified live by fetching each URL and confirming its `<title>`.
Beefy Waker is on the `internal` Traefik entrypoint, so it has no WAN URL and
falls back to the existing "needs VPN" treatment.

### Samba tile

Samba runs in the mouse stack (`/home/pi/Projects/Docker/mouse/docker-compose.yaml`),
`network_mode: host` on fastpi, so shares live at `fastpi.homelab`.

Three shares, taken from the `SAMBA_VOLUME_CONFIG_*` blocks:

| Share | Path | Access | Users |
|---|---|---|---|
| `mouse` | `/mnt/seagate-red` | read/write | `mouse` |
| `admin_books` | `/mnt/seagate-black/library` | read/write | `mouse` |
| `books` | `/mnt/seagate-black/library` | read-only | `books`, `mouse` |

## Design

### Data model

A service gains one optional field, `shares`. When present the tile is not a
link — clicking opens a modal. This keeps `services.js` declarative: no markup
or behaviour in the data file, matching how the file already works.

```js
{ category: "media", name: "Samba (mouse)", icon: "📁",
  host: HOST,
  shares: [ { name, path, access, users }, ... ] }
```

### Rendering

`render()` branches on `svc.shares`:

- **Link tile** (existing): `<a href>` — unchanged.
- **Shares tile** (new): `<button class="row">` — same visual row, but opens the
  modal. A button, not an anchor, because it performs an action rather than
  navigating; this also gives keyboard activation for free.

The right-hand slot shows `3 shares` at home, and the existing `🔒 VPN` tag when
away, since SMB is LAN-only.

### Modal

A native `<dialog>` — no library, focus trapping and Escape-to-close come free,
and it satisfies the page's strict CSP (`script-src 'self'`, `style-src 'self'`:
no inline script or style is introduced).

Per share it shows the share name, access badge, the path on disk, the username(s),
and the two connect strings:

- macOS / Linux: `smb://fastpi.homelab/<share>`
- Windows: `\\fastpi.homelab\<share>`

Each connect string has a copy button (`navigator.clipboard`, available since the
page is served over HTTPS).

### Passwords

Passwords are **never** rendered. They live only in `mouse/secrets` and are
referenced in compose as `${SAMBA_ACCOUNT_*}`. The modal shows usernames only and
carries an explicit footer note saying passwords are not listed. The landing page
is public via `home.holy-grail.ch`, so this is a hard requirement, not a nicety.

## Non-goals

- No live share status / reachability probing.
- No password display or credential storage, ever.
- Not fixing the stale `phpLDAPadmin` tile or adding Authentik — separate change.

## Verification

Fetch `services.js`, `app.js`, `index.html`, and `styles.css` through the public
entrypoint (`https://home.holy-grail.ch`) and confirm the new content is served,
and that no password value appears anywhere in the served payload.
