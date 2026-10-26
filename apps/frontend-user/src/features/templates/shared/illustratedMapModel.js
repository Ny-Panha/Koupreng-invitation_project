export const MAP_NODE_TYPES = ['destination', 'road', 'arrow', 'label', 'building', 'intersection', 'market', 'school', 'pagoda', 'parking'];
export const MAP_THEMES = { ivory: ['#fff8e8', '#725425'], ink: ['#f2f4f1', '#304338'], rose: ['#fff2ef', '#7f3543'] };
export const mapSize = value => value?.aspectRatio === 'portrait' ? [600, 900] : value?.aspectRatio === 'square' ? [800, 800] : [1000, 600];
export const bounded = (value, min, max, fallback = min) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
export function fitMapNode(node) {
  const width = bounded(node.width, .02, .8), height = bounded(node.height, .02, .8);
  return { ...node, width, height, x: bounded(node.x, Math.max(.05, width / 2), Math.min(.95, 1 - width / 2)), y: bounded(node.y, Math.max(.05, height / 2), Math.min(.95, 1 - height / 2)) };
}
