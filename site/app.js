"use strict";

const STORE_KEY = "homelab-mode";
const root = document.documentElement;

function getMode() {
  return localStorage.getItem(STORE_KEY) === "away" ? "away" : "home";
}

function setMode(mode) {
  localStorage.setItem(STORE_KEY, mode);
  root.dataset.mode = mode;
  document.getElementById("modeBadge").textContent = mode === "away" ? "Away" : "Home";
  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", mode === "away" ? "#5a2a0a" : "#221248");
  render();
}

// Decide the link + tag for a service in the current mode.
function resolve(svc, mode) {
  if (mode === "home") {
    return { href: svc.lan, tag: null, hint: prettyHost(svc.lan) };
  }
  // away
  if (svc.wan) {
    return { href: svc.wan, tag: "public", hint: prettyHost(svc.wan) };
  }
  return { href: svc.lan, tag: "vpn", hint: "needs VPN" };
}

// Turn a URL into a compact right-aligned hint (":3001/path" or "host").
function prettyHost(url) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith(".homelab") || u.hostname === "fastpi.homelab") {
      const path = u.pathname !== "/" ? u.pathname : "";
      return (u.port ? ":" + u.port : "") + path;
    }
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function iconNode(icon) {
  const box = document.createElement("span");
  box.className = "ic";
  if (/^(https?:|\/|\.)/.test(icon)) {
    const img = document.createElement("img");
    img.src = icon;
    img.alt = "";
    img.loading = "lazy";
    box.appendChild(img);
  } else {
    box.textContent = icon; // emoji
  }
  return box;
}

// ---- Shares popup ----------------------------------------------------------
// Used by non-web services (Samba): the row opens this instead of navigating.
// Usernames only — passwords are never rendered, this page is public.
function shareRow(svc, sh) {
  const wrap = document.createElement("div");
  wrap.className = "share";

  const head = document.createElement("div");
  head.className = "share-head";
  const nm = document.createElement("span");
  nm.className = "share-name";
  nm.textContent = sh.name;
  head.appendChild(nm);
  const badge = document.createElement("span");
  badge.className = "share-access" + (sh.access === "read-only" ? " ro" : "");
  badge.textContent = sh.access;
  head.appendChild(badge);
  wrap.appendChild(head);

  const facts = document.createElement("div");
  facts.className = "share-facts";
  facts.textContent = `${sh.path} · user${sh.users.length > 1 ? "s" : ""}: ${sh.users.join(", ")}`;
  wrap.appendChild(facts);

  for (const [label, url] of [
    ["macOS / Linux", `smb://${svc.host}/${sh.name}`],
    ["Windows", `\\\\${svc.host}\\${sh.name}`],
  ]) {
    const line = document.createElement("div");
    line.className = "share-conn";

    const tag = document.createElement("span");
    tag.className = "share-os";
    tag.textContent = label;
    line.appendChild(tag);

    const code = document.createElement("code");
    code.textContent = url;
    line.appendChild(code);

    const copy = document.createElement("button");
    copy.className = "share-copy";
    copy.type = "button";
    copy.textContent = "copy";
    copy.setAttribute("aria-label", `Copy ${label} address for ${sh.name}`);
    copy.addEventListener("click", () => {
      navigator.clipboard.writeText(url).then(
        () => {
          copy.textContent = "copied";
          setTimeout(() => (copy.textContent = "copy"), 1200);
        },
        () => (copy.textContent = "failed")
      );
    });
    line.appendChild(copy);

    wrap.appendChild(line);
  }

  return wrap;
}

function openShares(svc) {
  document.getElementById("sharesTitle").textContent = svc.name;
  const body = document.getElementById("sharesBody");
  body.innerHTML = "";
  for (const sh of svc.shares) body.appendChild(shareRow(svc, sh));
  document.getElementById("sharesModal").showModal();
}

function render() {
  const mode = root.dataset.mode;
  const q = document.getElementById("search").value.trim().toLowerCase();
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  let shown = 0;

  for (const cat of CATEGORIES) {
    const items = SERVICES.filter(
      (s) =>
        s.category === cat.id &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          (s.desc || "").toLowerCase().includes(q))
    );
    if (!items.length) continue;

    const section = document.createElement("section");
    section.className = "cat";
    section.style.setProperty("--cat", cat.color);

    const h = document.createElement("h2");
    h.className = "cat-title";
    h.textContent = cat.label;
    section.appendChild(h);

    const list = document.createElement("div");
    list.className = "rows";

    for (const svc of items) {
      // Services with `shares` open a popup; everything else is a plain link.
      const isShares = Array.isArray(svc.shares);
      const { href, tag, hint } = isShares
        ? { href: null,
            tag: mode === "away" ? "vpn" : null,
            hint: `${svc.shares.length} shares` }
        : resolve(svc, mode);

      let a;
      if (isShares) {
        a = document.createElement("button");
        a.type = "button";
        a.addEventListener("click", () => openShares(svc));
      } else {
        a = document.createElement("a");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.className = "row";

      a.appendChild(iconNode(svc.icon));

      const meta = document.createElement("div");
      meta.className = "meta";
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = svc.name;
      meta.appendChild(name);
      const sub = document.createElement("div");
      sub.className = "sub";
      sub.textContent = svc.note ? `${svc.desc} · ${svc.note}` : svc.desc || "";
      if (sub.textContent) meta.appendChild(sub);
      a.appendChild(meta);

      const right = document.createElement("div");
      right.className = "right";
      if (tag === "public") {
        right.innerHTML = '<span class="tag tag-public">public</span>';
      } else if (tag === "vpn") {
        right.innerHTML = '<span class="tag tag-vpn">🔒 VPN</span>';
      } else {
        right.innerHTML = `<span class="host">${hint}</span>`;
      }
      a.appendChild(right);

      list.appendChild(a);
      shown++;
    }

    section.appendChild(list);
    grid.appendChild(section);
  }

  document.getElementById("count").textContent =
    `${shown} service${shown === 1 ? "" : "s"}`;
  document.getElementById("footHint").textContent =
    mode === "away"
      ? "Away · public links work anywhere; 🔒 need WireGuard"
      : "Home · direct LAN links";
}

// ---- wiring ----------------------------------------------------------------
document.getElementById("modeToggle").addEventListener("click", () => {
  setMode(root.dataset.mode === "away" ? "home" : "away");
});
document.getElementById("search").addEventListener("input", render);

const sharesModal = document.getElementById("sharesModal");
document.getElementById("sharesClose")
  .addEventListener("click", () => sharesModal.close());
// Click outside the dialog body closes it.
sharesModal.addEventListener("click", (e) => {
  if (e.target === sharesModal) sharesModal.close();
});

// initial
setMode(getMode());
