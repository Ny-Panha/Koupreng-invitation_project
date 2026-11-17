// Inspect expanded route JSX without mounting a guard or initializing a lazy page.
export function inventoryShells(tree, app) {
  const rows=[];
  function describe(element) {
    if(!element?.props) return [];
    const type=element.type;
    let name=type?.name||null, module=null, loader=null;
    if(type?._payload && typeof type._payload._result==='function') {
      loader=String(type._payload._result);
      module=loader.match(/(?:import|__vite_ssr_dynamic_import__)\(\s*["']([^"']+)["']/)?.[1]||null;
      if(module) name=module.split('/').at(-1).replace(/\.[^.]+$/,'');
    }
    const descriptor=name?{name,module,loader}:null;
    return [...(descriptor?[descriptor]:[]),...(['RequireAuth','RequireAdmin'].includes(name)?describe(element.props.children):[])];
  }
  function visit(node,parent='',shells=[]) {
    if(Array.isArray(node)){node.forEach(n=>visit(n,parent,shells));return;}
    if(!node?.props)return;
    const p=node.props;
    const full=typeof p.path==='string' ? p.path.startsWith('/')||p.path==='*'?p.path:`${parent}/${p.path}` : parent;
    const own=describe(p.element);
    const children=[p.children].flat(Infinity).filter(Boolean);
    if(typeof p.path==='string'||p.index) rows.push({app,pattern:full||'/',index:!!p.index,shells,components:own,hasChildRoutes:children.length>0});
    visit(p.children,full,[...shells,...own]);
  }
  visit(tree);
  return rows.filter(row=>!rows.some(other=>other!==row&&other.pattern===row.pattern&&other.index));
}
