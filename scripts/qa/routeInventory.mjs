// Inspect declared React elements without mounting guards, lazy pages or providers.
export function inventoryRoutes(tree, source, inheritedAccess = "public", parentPath = "") {
  const rows = [];
  function guard(element) {
    if (!element?.props) return null;
    const name = element.type?.name;
    if (name === "RequireAuth") return "authenticated";
    if (name === "RequireAdmin") return "admin";
    return [element.props.children].flat(Infinity).map(guard).find(Boolean);
  }
  function component(element) {
    if (!element?.props) return "none";
    if (["RequireAuth", "RequireAdmin"].includes(element.type?.name)) return component(element.props.children);
    if (element.type?.name) return element.type.name;
    return typeof element.type === "object" ? "lazy page" : "page";
  }
  function visit(node, parent, access) {
    if (Array.isArray(node)) { node.forEach(child => visit(child, parent, access)); return; }
    if (!node?.props) return;
    const props = node.props;
    const nextAccess = guard(props.element) || access;
    let fullPath = parent;
    if (typeof props.path === "string") fullPath = props.path.startsWith("/") || props.path === "*" ? props.path : `${parent}/${props.path}`;
    if (typeof props.path === "string" || props.index) {
      rows.push({ pattern: fullPath || "/", index: Boolean(props.index), access: nextAccess,
        component: component(props.element), redirect: props.element?.type?.name === "Navigate" ? props.element.props.to : null, source });
    }
    visit(props.children, fullPath, nextAccess);
  }
  visit(tree, parentPath, inheritedAccess);
  // A layout route and its index resolve the same URL pattern; retain both components in one row.
  return rows.filter(row => {
    if (!row.index) return true;
    const layout = rows.find(other => other !== row && other.pattern === row.pattern);
    if (!layout) return true;
    layout.layoutComponent = layout.component;
    layout.component = row.component;
    layout.index = true;
    return false;
  });
}
