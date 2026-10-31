(() => {
  const p = new URLSearchParams(location.search);
  const root = document.documentElement;
  const str = (k, d = "") => { const v = p.get(k); return v === null || v.trim() === "" ? d : v.trim(); };
  const num = (k, d = NaN) => { const v = parseFloat(p.get(k)); return Number.isFinite(v) ? v : d; };
  const hex = v => /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v || "") ? "#" + v : null;

  if (hex(p.get("accent"))) root.style.setProperty("--accent", hex(p.get("accent")));
  const bg = p.get("bg");
  if (bg === "transparent") root.style.setProperty("--bg", "transparent");
  else if (hex(bg)) root.style.setProperty("--bg", hex(bg));

  const WORDS = { fine: "Fine", look: "Look soon", broken: "Broken", unknown: "No reading" };
  const RANK = { fine: 0, unknown: 1, look: 2, broken: 3 };

  function judge(v) {
    const look = num("look"), broken = num("broken"), low = str("good", "high") === "low";
    if (!Number.isFinite(v)) return "unknown";
    if (!Number.isFinite(look) && !Number.isFinite(broken)) return null;
    const past = t => Number.isFinite(t) && (low ? v >= t : v <= t);
    if (past(broken)) return "broken";
    if (past(look)) return "look";
    return "fine";
  }

  function state(auto) {
    const s = str("state").toLowerCase();
    const out = WORDS[s] ? s : auto;
    if (WORDS[out]) root.dataset.state = out;
    return out;
  }

  function when(t) {
    if (!t) return null;
    if (/^\d{9,13}$/.test(t)) return new Date(t.length > 10 ? +t : +t * 1000);
    const d = new Date(t);
    return isNaN(d) ? null : d;
  }

  function span(ms) {
    const m = Math.floor(Math.abs(ms) / 60000);
    if (m < 1) return "under 1 min";
    if (m < 60) return m + " min";
    const h = Math.floor(m / 60);
    if (h < 24) return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
    const d = Math.floor(h / 24);
    return d === 1 ? "1 day" : d + " days";
  }

  function ago(d) {
    const ms = Date.now() - d;
    return ms < 60000 ? "just now" : span(ms) + " ago";
  }

  const fmt = (n, dp = 1) => Number.isFinite(n)
    ? n.toLocaleString("en-IN", { maximumFractionDigits: dp }) : "–";

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  const NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }

  function caption(label, s, meta) {
    const cap = document.querySelector(".cap");
    cap.replaceChildren();
    cap.append(el("span", "lab", str("label", label)));
    const right = el("span", "meta");
    if (meta) right.append(el("span", "chip", meta));
    else if (s) right.append(el("span", "chip", WORDS[s]));
    const t = when(p.get("updated"));
    if (t) right.append(el("span", "", "checked " + ago(t)));
    if (right.childNodes.length) cap.append(right);
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const settle = fn => reduced ? fn() : requestAnimationFrame(() => requestAnimationFrame(fn));

  window.G = { p, str, num, judge, state, when, span, ago, fmt, el, svg, caption, settle, reduced, WORDS, RANK };
})();
