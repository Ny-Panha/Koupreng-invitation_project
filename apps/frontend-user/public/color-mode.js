// Apply a saved management/marketing preference before React paints. Template
// artwork is independently themed and is never selected by these rules.
(() => {
  let mode='light';
  try { if(localStorage.getItem('koupreng.colorMode')==='dark') mode='dark'; } catch { /* session preference */ }
  document.documentElement.dataset.colorMode=mode;
})();
