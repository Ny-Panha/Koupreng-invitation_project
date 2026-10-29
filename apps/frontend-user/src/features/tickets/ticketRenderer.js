const WIDTH = 600;
const HEIGHT = 900;
let fonts;
const images = new Map();
const FONTS = { MOUL: "Ticket Moul", KANTUMRUY: "Ticket Khmer", CORMORANT: "Ticket Cormorant" };

async function loadFonts() {
  fonts ||= Promise.all([
    ["Ticket Moul", "Moul-Regular.woff2"], ["Ticket Khmer", "KantumruyPro.woff2"], ["Ticket Cormorant", "CormorantGaramond.woff2"],
  ].map(async ([name, file]) => {
    const face = new FontFace(name, `url(/fonts/silk-heritage/${file})`);
    let timeout;
    try {
      await Promise.race([face.load(), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Ticket fonts could not load. Retry the preview.')), 15000); })]);
      document.fonts.add(face);
    } finally { clearTimeout(timeout); }
  })).catch(error => { fonts = null; throw error; });
  await fonts;
}
function image(url) {
  if (!url) return Promise.resolve(null);
  if (images.size > 20) images.delete(images.keys().next().value);
  if (!images.has(url)) images.set(url, new Promise((resolve, reject) => {
    const img = new Image(); img.crossOrigin = "anonymous"; img.referrerPolicy = "no-referrer";
    const timeout = setTimeout(() => img.onerror(), 15000);
    img.onload = () => { clearTimeout(timeout); resolve(img); };
    img.onerror = () => { clearTimeout(timeout); images.delete(url); reject(new Error("An image could not be loaded. Check its availability and retry.")); };
    img.src = url;
  }));
  return images.get(url);
}

export function wrapTicketText(context, text, maxWidth) {
  const graphemes = Array.from(new Intl.Segmenter("km", { granularity: "grapheme" }).segment(String(text || "")), item => item.segment);
  const lines = []; let line = "";
  for (const part of graphemes) {
    if (part === "\n" || (line && context.measureText(line + part).width > maxWidth)) { lines.push(line.trim()); line = part === "\n" ? "" : part; }
    else line += part;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}
function text(ctx, value, x, y, { size = 18, width = 480, maxLines = 3, lineHeight = 1.8, family = "Ticket Khmer", color = "#33352f" } = {}) {
  let lines;
  do { ctx.font = `${size}px "${family}", "Ticket Khmer", sans-serif`; lines = wrapTicketText(ctx, value, width); if (lines.length <= maxLines || size <= 11) break; size--; } while (size >= 11);
  if (lines.length > maxLines) throw new Error("This text is too long for the ticket. Shorten the header, footer or event title.");
  ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * size * lineHeight));
}
function crop(ctx, img, x, y, width, height, focusX = 50, focusY = 50, fit = 'COVER') {
  if (!img) return;
  const scale = (fit === 'CONTAIN' ? Math.min : Math.max)(width / img.width, height / img.height);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
  ctx.drawImage(img, x + (width - img.width * scale) * Math.max(0, Math.min(100, focusX)) / 100, y + (height - img.height * scale) * Math.max(0, Math.min(100, focusY)) / 100, img.width * scale, img.height * scale); ctx.restore();
}

// The same canvas is the preview and the export. No application chrome is captured.
export async function renderTicket(canvas, ticket, scale = 2) {
  const english = String(ticket.languageMode).toLowerCase() === 'en';
  if (![2, 3].includes(scale)) throw new Error("Choose 2× or 3× resolution");
  await loadFonts();
  const { design, backgroundUrl, coverUrl } = ticket.appearance;
  const [background, cover, qr] = await Promise.all([image(backgroundUrl), image(coverUrl), image(ticket.qrCodeDataUri)]);
  const target = document.createElement("canvas"); target.width = WIDTH * scale; target.height = HEIGHT * scale;
  const ctx = target.getContext("2d"); ctx.scale(scale, scale);
  ctx.fillStyle = design.layout === "MINIMAL" ? "#ffffff" : design.layout === "FLORAL" ? "#f3f5ee" : "#fffaf0"; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (design.layout !== 'MINIMAL') {
    const paper = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    paper.addColorStop(0, '#ffffff70'); paper.addColorStop(.48, '#ffffff00'); paper.addColorStop(1, '#d7bd8520');
    ctx.fillStyle = paper; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  if (background) { ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(.4, design.backgroundOpacity ?? .12)); crop(ctx, background, 0, 0, WIDTH, HEIGHT); ctx.restore(); }
  ctx.strokeStyle = design.accent; ctx.lineWidth = 1.5;
  if (design.frame !== "NONE") { ctx.strokeRect(20, 20, 560, 860); if (design.frame === "DOUBLE") ctx.strokeRect(27, 27, 546, 846); }
  if (design.layout === 'GOLD' && design.frame !== 'NONE') {
    ctx.save(); ctx.lineWidth = 1; ctx.globalAlpha = .65;
    for (const [x, y, sx, sy] of [[36,36,1,1], [564,36,-1,1], [36,864,1,-1], [564,864,-1,-1]]) {
      ctx.beginPath(); ctx.moveTo(x, y + 38 * sy); ctx.lineTo(x, y); ctx.lineTo(x + 38 * sx, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 7 * sx, y + 29 * sy); ctx.bezierCurveTo(x + 8 * sx, y + 8 * sy, x + 8 * sx, y + 8 * sy, x + 29 * sx, y + 7 * sy); ctx.stroke();
    }
    ctx.restore();
  }
  if (design.layout === "FLORAL") {
    for (const [x, y, direction] of [[45, 45, 1], [555, 855, -1]]) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 60 * direction, y + 10 * direction, x + 15 * direction, y + 140 * direction, x + 50 * direction, y + 190 * direction); ctx.stroke();
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(x + (i % 2 ? 25 : 3) * direction, y + i * 22 * direction, 7, 16, .7, 0, Math.PI * 2); ctx.stroke(); }
    }
  }
  if (design.layout === "GOLD") { ctx.fillStyle = design.accent; for (const y of [40, 345]) { ctx.beginPath(); ctx.moveTo(300, y); ctx.lineTo(309, y + 8); ctx.lineTo(300, y + 16); ctx.lineTo(291, y + 8); ctx.closePath(); ctx.fill(); } }
  if (design.layout === "MINIMAL") { ctx.fillStyle = design.accent; ctx.fillRect(40, 40, 4, 260); }
  if (design.layout === "IVORY") { ctx.strokeStyle = design.accent; ctx.beginPath(); ctx.arc(300, 290, 29, 0, Math.PI * 2); ctx.stroke(); text(ctx, "K", 300, 290, { family: "Ticket Cormorant", size: 30, color: design.accent }); }
  text(ctx, design.header, 300, 78, { size: 19, maxLines: 2, color: design.accent, family: FONTS[design.font] });
  const names = [ticket.hostName, ticket.partnerName].filter(Boolean).join(" & ");
  text(ctx, names || ticket.title, 300, 130, { size: 24, maxLines: 2, family: FONTS[design.font] });
  if (names) text(ctx, ticket.title, 300, 198, { size: 15, maxLines: 2 });
  if (cover) crop(ctx, cover, 130, 245, 340, 105, design.coverFocusX ?? 50, design.coverFocusY ?? 50, design.coverFit || 'COVER');
  if (!cover && design.layout === 'GOLD') {
    const initials = [ticket.hostName, ticket.partnerName].filter(Boolean)
      .map(name => new Intl.Segmenter('km', { granularity: 'grapheme' }).segment(name.trim())[Symbol.iterator]().next().value?.segment || '').join(' & ');
    if (initials) {
      ctx.save(); ctx.globalAlpha = .55; ctx.strokeStyle = design.accent; ctx.lineWidth = .75;
      for (const radius of [46, 51]) { ctx.beginPath(); ctx.arc(300, 288, radius, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      text(ctx, initials, 300, 288, { family: 'Ticket Cormorant', size: 28, width: 86, maxLines: 1, color: design.accent });
    }
  }
  if (cover) { ctx.save(); ctx.globalAlpha = .45; ctx.strokeStyle = design.accent; ctx.lineWidth = .75; ctx.strokeRect(125, 240, 350, 115); ctx.restore(); }
  ctx.save(); ctx.strokeStyle = design.accent; ctx.globalAlpha = .35; ctx.lineWidth = .75;
  for (const [from, to] of [[125, 264], [336, 475]]) { ctx.beginPath(); ctx.moveTo(from, 452); ctx.lineTo(to, 452); ctx.stroke(); }
  ctx.restore();
  text(ctx, [ticket.eventDate, ticket.eventTime?.slice(0, 5)].filter(Boolean).join(" · "), 300, 382, { size: 18, maxLines: 1 });
  text(ctx, ticket.venueName || "", 300, 414, { size: 16, maxLines: 2 });
  text(ctx, ticket.kind === "GUEST" ? (english ? 'Reserved for' : "ជូនចំពោះ · Reserved for") : (english ? 'General invitation' : "ធៀបអញ្ជើញទូទៅ · General invitation"), 300, 474, { size: 13, maxLines: 1, color: design.accent });
  text(ctx, ticket.guestName || (english ? 'You and your family' : "លោកអ្នក និងក្រុមគ្រួសារ"), 300, 510, { size: 24, maxLines: 3, family: FONTS[design.font], lineHeight: 1.7 });
  const details = [ticket.tableName && `${english ? 'Table' : 'តុ / Table'} ${ticket.tableName}`, ticket.seatNumber && `Seat ${ticket.seatNumber}`, ticket.seatCount && `${english ? 'Guests' : 'ភ្ញៀវ / Guests'} ${ticket.seatCount}`, ticket.group].filter(Boolean).join(" · ");
  text(ctx, details, 300, 616, { size: 13, maxLines: 1 });
  ctx.fillStyle = "white"; ctx.fillRect(198, 640, 204, 204);
  if (qr) { ctx.imageSmoothingEnabled = false; ctx.drawImage(qr, 210, 652, 180, 180); }
  text(ctx, design.footer, 300, 855, { size: 11, width: 490, maxLines: 2, lineHeight: 1.6 });
  canvas.width = target.width; canvas.height = target.height;
  canvas.getContext("2d").drawImage(target, 0, 0);
  return canvas;
}

export function ticketBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Ticket export failed. Retry.")), "image/png"));
}
