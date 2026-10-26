// Only our generated vector DOM is accepted. Never use this for uploaded SVG.
const NS = 'http://www.w3.org/2000/svg';
const FONTS = [
  ['Kantumruy Pro', 'KantumruyPro.woff2', 'KantumruyPro-OFL.txt'],
  ['Moul', 'Moul-Regular.woff2', 'Moul-OFL.txt'],
  ['Cormorant Garamond', 'CormorantGaramond.woff2', 'CormorantGaramond-OFL.txt'],
];
async function localResource(file, binary = false) {
  const response = await fetch(`/fonts/silk-heritage/${file}`, { credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('The local font or license could not be loaded. Retry exporting.');
  return binary ? response.arrayBuffer() : response.text();
}
export function cleanVector(source) {
  const copy = source.cloneNode(true);
  copy.querySelectorAll('[data-editor-only]').forEach(node => node.remove());
  for (const node of [copy, ...copy.querySelectorAll('*')]) {
    if (!['svg', 'g', 'path', 'rect', 'ellipse', 'circle', 'line', 'polyline', 'polygon', 'text', 'tspan', 'title', 'desc'].includes(node.localName)) throw new Error('Export contains an unsupported vector element.');
    for (const attr of [...node.attributes]) {
      if (/^on/i.test(attr.name) || /href/i.test(attr.name) || /url\s*\(/i.test(attr.value)) throw new Error('Export contains an external or executable resource.');
      if (['tabindex', 'class', 'style', 'aria-labelledby', 'aria-hidden', 'focusable', 'id'].includes(attr.name) || attr.name.startsWith('data-')) node.removeAttribute(attr.name);
    }
  }
  copy.setAttribute('xmlns', NS);
  return copy;
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportVector(source, { format = 'svg', name = 'illustrative-venue-map', color = '#725425' } = {}) {
  const copy = cleanVector(source);
  const box = source.viewBox.baseVal;
  if (!box.width || !box.height || box.width > 2048 || box.height > 2048) throw new Error('Export dimensions are out of bounds.');
  copy.setAttribute('width', box.width); copy.setAttribute('height', box.height);
  copy.setAttribute('color', color);
  // Load and embed only licensed, bundled font faces; never a user-supplied URL.
  const fonts = await Promise.all(FONTS.map(async ([family, file, license]) => ({ family, bytes: await localResource(file, true), license: await localResource(license) })));
  const style = document.createElementNS(NS, 'style');
  style.textContent = fonts.map(({ family, bytes }) => {
    let binary = ''; for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
    return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${btoa(binary)}) format('woff2');}`;
  }).join('\n');
  copy.prepend(style);
  const metadata = document.createElementNS(NS, 'metadata');
  metadata.textContent = fonts.map(font => `${font.family}\n${font.license}`).join('\n\n'); copy.prepend(metadata);
  if (format === 'svg') {
    download(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml;charset=utf-8' }), `${name}.svg`);
    return;
  }
  if (!['png', 'webp'].includes(format)) throw new Error('Unsupported export format.');
  // SVG-image font support differs between engines. Draw vector shapes first,
  // then shape the text directly with Canvas and the same local FontFace bytes.
  for (const font of fonts) {
    const face = new FontFace(font.family, font.bytes); await face.load(); document.fonts.add(face);
  }
  const canvas = document.createElement('canvas'), scale = 2;
  canvas.width = box.width * scale; canvas.height = box.height * scale;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas export is unavailable. Use SVG export.');
  copy.querySelectorAll('text, style, metadata').forEach(node => node.remove());
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('Vector image could not be rendered. Use SVG export.')); image.src = url; });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const root = source.getCTM();
    if (!root) throw new Error('Open the vector preview before exporting.');
    for (const node of source.querySelectorAll('text')) {
      if (node.closest('[data-editor-only]')) continue;
      const matrix = root.inverse().multiply(node.getCTM());
      context.setTransform(matrix.a * scale, matrix.b * scale, matrix.c * scale, matrix.d * scale, matrix.e * scale, matrix.f * scale);
      const computed = getComputedStyle(node);
      context.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
      context.fillStyle = computed.fill === 'currentcolor' ? color : computed.fill;
      context.textAlign = ({ middle: 'center', end: 'right' })[computed.textAnchor] || 'left';
      context.textBaseline = computed.dominantBaseline === 'middle' ? 'middle' : 'alphabetic';
      const lines = node.querySelectorAll('tspan');
      for (const line of lines.length ? lines : [node]) {
        const x = Number(line.getAttribute('x') ?? node.getAttribute('x')) || 0, y = Number(line.getAttribute('y') ?? node.getAttribute('y')) || 0;
        if (computed.stroke && computed.stroke !== 'none') { context.strokeStyle = computed.stroke; context.lineWidth = Number.parseFloat(computed.strokeWidth) || 1; context.lineJoin = 'round'; context.strokeText(line.textContent, x, y); }
        context.fillText(line.textContent, x, y);
      }
    }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, `image/${format}`, .94));
    if (!blob || blob.type !== `image/${format}`) throw new Error(`${format.toUpperCase()} export is unavailable. Use SVG or PNG export.`);
    download(blob, `${name}.${format}`);
  } finally { URL.revokeObjectURL(url); }
}
