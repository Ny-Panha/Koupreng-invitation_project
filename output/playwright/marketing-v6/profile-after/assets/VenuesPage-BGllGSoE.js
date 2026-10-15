import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{An as r,En as i,jn as a}from"./index-FC8xx69x.js";import{t as o}from"./background-Dt0NvFi2.js";import{n as s,t as c}from"./proxy-CKUgvGHl.js";import{t as l}from"./use-in-view-B5LGy31y.js";import{t as u}from"./useBackendMessages-C8dAuOEY.js";var d=e(t(),1),f={hidden:{opacity:0,y:48,scale:.97},visible:{opacity:1,y:0,scale:1,transition:{duration:.65,ease:[.22,1,.36,1]}}},p=n();function m({children:e,className:t=``,delay:n=0,variants:r=f}){let i=(0,d.useRef)(null),a=l(i,{once:!0,margin:`-80px`});return(0,p.jsx)(c.div,{ref:i,className:t,initial:`hidden`,animate:a?`visible`:`hidden`,variants:r,transition:{delay:n},children:e})}var h=e=>[{id:1,name:e(`venue1Name`)||`សាលមហោស្រព កោះពេជ្រ`,location:e(`phnomPenh`)||`ភ្នំពេញ`,capacity:e(`venue1Capacity`)||`៥០០ - ២០០០ នាក់`,priceRange:`$$$`,image:`https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop`,tags:[e(`tagPopular`)||`ពេញនិយម`,e(`tagBigHall`)||`សាលធំ`]},{id:2,name:e(`venue2Name`)||`The Premier Centre Sen Sok`,location:e(`phnomPenh`)||`ភ្នំពេញ`,capacity:e(`venue2Capacity`)||`៣០០ - ១៥០០ នាក់`,priceRange:`$$$`,image:`https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop`,tags:[e(`tagModern`)||`ទំនើប`,e(`tagGoodService`)||`សេវាកម្មល្អ`]},{id:3,name:e(`venue3Name`)||`សណ្ឋាគារ រ៉េស៊ីដង់ សុខា`,location:e(`siemReap`)||`សៀមរាប`,capacity:e(`venue3Capacity`)||`២០០ - ៨០០ នាក់`,priceRange:`$$$$`,image:`https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop`,tags:[e(`tagLuxuryEng`)||`Luxury`,e(`tagLuxury`)||`ប្រណីត`]},{id:4,name:e(`venue4Name`)||`Classy Hotel & Spa`,location:e(`battambang`)||`បាត់ដំបង`,capacity:e(`venue4Capacity`)||`១៥០ - ៥០០ នាក់`,priceRange:`$$`,image:`https://images.unsplash.com/photo-1543157145-f78c636d023d?q=80&w=1000&auto=format&fit=crop`,tags:[e(`battambang`)||`បាត់ដំបង`,e(`tagAffordable`)||`តម្លៃសមរម្យ`]}],g=()=>{let{text:e}=u(`venues`),t=(0,d.useMemo)(()=>h(e),[e]),[n,l]=(0,d.useState)(``),{id:f}=a(),g=r(),[_,v]=(0,d.useState)(null),y=(0,d.useRef)(null),b=(0,d.useRef)(null);(0,d.useEffect)(()=>{v(f&&t.find(e=>String(e.id)===String(f))||null)},[f,t]);let x=(e,t)=>{b.current=t.currentTarget,v(e),g(`/venues/${e.id}`,{replace:!0})},S=(0,d.useCallback)(()=>{v(null),g(`/venues`,{replace:!0})},[g]);(0,d.useEffect)(()=>{if(!_)return;let e=document.body.style.overflow;document.body.style.overflow=`hidden`;let t=y.current,n=()=>[...t.querySelectorAll(`button:not([disabled]),a[href],input,select,textarea,[tabindex="0"]`)];n()[0]?.focus();let r=e=>{if(e.key===`Escape`&&(e.preventDefault(),S()),e.key!==`Tab`)return;let r=n(),i=r[0],a=r.at(-1);e.shiftKey&&(document.activeElement===i||!t.contains(document.activeElement))?(e.preventDefault(),a?.focus()):!e.shiftKey&&(document.activeElement===a||!t.contains(document.activeElement))&&(e.preventDefault(),i?.focus())};return document.addEventListener(`keydown`,r),()=>{document.removeEventListener(`keydown`,r),document.body.style.overflow=e,b.current?.isConnected&&b.current.focus()}},[_,S]);let C=t.filter(e=>e.name.toLowerCase().includes(n.toLowerCase())||e.location.toLowerCase().includes(n.toLowerCase()));return(0,p.jsxs)(`div`,{className:`venues-page-wrapper`,children:[(0,p.jsxs)(`div`,{className:`fixed-bg-overlay`,children:[(0,p.jsx)(`div`,{className:`bg-image`,style:{backgroundImage:`url(${o})`}}),(0,p.jsx)(`div`,{className:`bg-gradient-cover`})]}),(0,p.jsxs)(`main`,{className:`venues-content`,children:[(0,p.jsxs)(`div`,{className:`container`,children:[(0,p.jsx)(m,{children:(0,p.jsxs)(`div`,{className:`header-content`,children:[(0,p.jsx)(c.span,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},className:`sub-title`,children:e(`subtitle`)||`FIND YOUR PERFECT VENUE`}),(0,p.jsxs)(`h1`,{className:`main-title`,children:[e(`titleFind`)||`ស្វែងរក`,(0,p.jsx)(`span`,{className:`gold-text`,children:e(`titleVenues`)||`ទីកន្លែងមង្គល`})]}),(0,p.jsxs)(`div`,{className:`divider-modern`,children:[(0,p.jsx)(`span`,{}),(0,p.jsx)(`div`,{className:`diamond`}),(0,p.jsx)(`span`,{})]}),(0,p.jsx)(`div`,{className:`search-box-wrapper`,children:(0,p.jsxs)(`div`,{className:`search-box`,children:[(0,p.jsx)(`input`,{type:`text`,"aria-label":e(`searchPlaceholder`),placeholder:e(`searchPlaceholder`)||`ស្វែងរកតាមឈ្មោះ ឬទីតាំង...`,onChange:e=>l(e.target.value)}),(0,p.jsx)(`button`,{className:`btn-search`,children:e(`searchBtn`)||`ស្វែងរក`})]})})]})}),(0,p.jsx)(`div`,{className:`venues-grid`,children:C.map((t,n)=>(0,p.jsx)(m,{delay:n*.1,children:(0,p.jsxs)(c.div,{whileHover:{y:-10},className:`venue-card`,children:[(0,p.jsxs)(`div`,{className:`venue-image-container`,children:[(0,p.jsx)(`img`,{src:t.image,alt:t.name,className:`venue-img`}),(0,p.jsx)(`div`,{className:`venue-tags`,children:t.tags.map(e=>(0,p.jsx)(`span`,{className:`tag`,children:e},e))}),(0,p.jsx)(`div`,{className:`img-overlay`})]}),(0,p.jsxs)(`div`,{className:`venue-info`,children:[(0,p.jsx)(`h3`,{className:`venue-name`,children:t.name}),(0,p.jsxs)(`div`,{className:`venue-meta`,children:[(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{className:`icon`,children:`📍`}),` `,t.location]}),(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{className:`icon`,children:`👥`}),` `,e(`capacity`)||`ចំណុះ:`,` `,t.capacity]}),(0,p.jsxs)(`p`,{children:[(0,p.jsx)(`span`,{className:`icon`,children:`💰`}),` `,e(`priceRangeText`)||`កម្រិតតម្លៃ:`,` `,(0,p.jsx)(`span`,{className:`gold-text-bold`,children:t.priceRange})]})]}),(0,p.jsx)(`button`,{type:`button`,onClick:e=>x(t,e),className:`view-detail-btn`,style:{width:`100%`,cursor:`pointer`},children:e(`viewDetail`)||`មើលព័ត៌មានលម្អិត`})]})]})},t.id))})]}),(0,p.jsx)(s,{children:_&&(0,p.jsx)(`div`,{className:`venue-modal-backdrop`,onClick:S,children:(0,p.jsxs)(c.div,{ref:y,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`public-venue-title`,initial:{opacity:0,scale:.94,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.94,y:20},transition:{duration:.22},className:`venue-modal-card`,onClick:e=>e.stopPropagation(),children:[(0,p.jsx)(`button`,{type:`button`,className:`venue-modal-close`,onClick:S,"aria-label":`Close venue details`,children:`✕`}),(0,p.jsxs)(`div`,{className:`venue-modal-image-wrapper`,children:[(0,p.jsx)(`img`,{src:_.image,alt:_.name,className:`venue-modal-img`}),(0,p.jsx)(`div`,{className:`venue-modal-tags`,children:_.tags.map(e=>(0,p.jsx)(`span`,{className:`tag`,children:e},e))})]}),(0,p.jsxs)(`div`,{className:`venue-modal-body`,children:[(0,p.jsx)(`span`,{className:`venue-modal-kicker`,children:`VENUE DETAIL • ព័ត៌មានលម្អិត`}),(0,p.jsx)(`h2`,{id:`public-venue-title`,className:`venue-modal-title`,children:_.name}),(0,p.jsxs)(`div`,{className:`venue-modal-meta-grid`,children:[(0,p.jsxs)(`div`,{className:`venue-modal-meta-item`,children:[(0,p.jsx)(`span`,{className:`meta-icon`,children:`📍`}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`small`,{children:`ទីតាំង / Location`}),(0,p.jsx)(`strong`,{children:_.location})]})]}),(0,p.jsxs)(`div`,{className:`venue-modal-meta-item`,children:[(0,p.jsx)(`span`,{className:`meta-icon`,children:`👥`}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`small`,{children:`ចំណុះ / Capacity`}),(0,p.jsx)(`strong`,{children:_.capacity})]})]}),(0,p.jsxs)(`div`,{className:`venue-modal-meta-item`,children:[(0,p.jsx)(`span`,{className:`meta-icon`,children:`💰`}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`small`,{children:`តម្លៃ / Price Range`}),(0,p.jsx)(`strong`,{className:`gold-text-bold`,children:_.priceRange})]})]})]}),(0,p.jsxs)(`div`,{className:`venue-modal-actions`,children:[(0,p.jsx)(i,{to:`/contact`,className:`venue-modal-contact-btn`,onClick:S,children:`ទំនាក់ទំនងសាកសួរ / Inquire Venue`}),(0,p.jsx)(`button`,{type:`button`,className:`venue-modal-secondary-btn`,onClick:S,children:`បិទ / Close`})]})]})]})})})]}),(0,p.jsx)(`style`,{children:`
        .venues-page-wrapper {
          min-height: 100vh;
          background-color: #fffcf7;
          font-family: 'Kantumruy Pro', sans-serif;
          position: relative;
        }
        .venues-page-wrapper :is(button,input,a):focus-visible { outline: 3px solid #7D6443; outline-offset: 4px; }

        /* Fixed Background Style ដូច Homepage */
        .fixed-bg-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .bg-image {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }
        .bg-gradient-cover {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(252, 248, 242, 0.4) 0%, rgba(252, 248, 242, 1) 1000%);
        }

        .venues-content {
          position: relative;
          z-index: 10;
          padding: 160px 20px 100px;
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
        }
        
        .header-content { text-align: center; margin-bottom: 80px; }
        
        .sub-title { 
          font-size: 11px; 
          font-weight: 800; 
          color: #B0926A; 
          letter-spacing: 4px; 
          display: block;
          margin-bottom: 10px;
        }

        .main-title { 
          font-family: 'Moul', serif; 
          font-size: clamp(28px, 5vw, 45px); 
          color: #222; 
          line-height: 1.6;
        }

        .gold-text { color: #B0926A; margin-left: 15px; }

        .divider-modern { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 20px; 
          margin: 25px 0; 
        }
        .divider-modern span { width: 80px; height: 1px; background: linear-gradient(to right, transparent, #B0926A, transparent); }
        .diamond { width: 10px; height: 10px; background: #B0926A; transform: rotate(45deg); box-shadow: 0 0 10px rgba(176,146,106,0.5); }

        /* Search Box ឱ្យស៊ីជាមួយ Modern Theme */
        .search-box-wrapper { display: flex; justify-content: center; margin-top: 40px; }
        .search-box { 
          width: 100%;
          max-width: 550px; 
          display: flex; 
          gap: 5px; 
          background: white; 
          padding: 6px; 
          border-radius: 20px; 
          box-shadow: 0 15px 35px rgba(176,146,106,0.1); 
          border: 1px solid white;
        }
        .search-box input { 
          flex: 1; border: none; padding: 12px 20px; outline: none; 
          font-family: 'Kantumruy Pro'; font-size: 14px; background: transparent; color: #444;
        }
        .btn-search { 
          background: #1a1a1a; color: white; border: none; padding: 10px 35px; 
          border-radius: 15px; font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .btn-search:hover { background: #B0926A; transform: scale(1.02); }

        /* Venue Grid Style */
        .venues-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
          gap: 40px; 
        }
        
        .venue-card { 
          background: rgba(255, 255, 255, 0.9); 
          backdrop-filter: blur(10px);
          border-radius: 35px; 
          overflow: hidden; 
          border: 1px solid white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .venue-image-container { 
          height: 260px; 
          position: relative; 
          overflow: hidden; 
        }
        .venue-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 1s;
        }
        .venue-card:hover .venue-img { transform: scale(1.1); }

        .img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
        }

        .venue-tags { position: absolute; top: 20px; left: 20px; display: flex; gap: 8px; z-index: 5; }
        .tag { 
          background: white; 
          color: #B0926A; 
          padding: 6px 15px; 
          border-radius: 50px; 
          font-size: 10px; 
          font-weight: 800; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          text-transform: uppercase;
        }

        .venue-info { padding: 30px; text-align: center; }
        .venue-name { 
          font-family: 'Moul'; 
          font-size: 18px; 
          color: #222; 
          margin-bottom: 20px; 
          line-height: 1.6; 
        }
        
        .venue-meta { margin-bottom: 25px; }
        .venue-meta p { 
          font-size: 14px; 
          color: #666; 
          margin-bottom: 10px; 
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .gold-text-bold { color: #B0926A; font-weight: 800; }
        
        .view-detail-btn { 
          display: block; 
          padding: 15px; 
          background: #f8f8f8;
          color: #333; 
          text-decoration: none; 
          border-radius: 18px; 
          font-size: 13px; 
          font-weight: 800; 
          transition: 0.3s;
          border: 1px solid #eee;
        }
        .view-detail-btn:hover { 
          background: #1a1a1a; 
          color: white; 
          border-color: #1a1a1a;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
          .venues-grid { grid-template-columns: 1fr; }
          .venues-content { padding-top: 120px; }
          .main-title { font-size: 24px; }
        }

        /* Venue Modal Styles */
        .venue-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 4000;
          background: rgba(15, 12, 9, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .venue-modal-card {
          position: relative;
          background: #fff;
          border-radius: 28px;
          max-width: 580px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          border: 1px solid rgba(176, 146, 106, 0.3);
        }
        .venue-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          border: none;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        .venue-modal-close:hover {
          background: rgba(0, 0, 0, 0.85);
          transform: scale(1.08);
        }
        .venue-modal-image-wrapper {
          position: relative;
          height: 260px;
          width: 100%;
          overflow: hidden;
          border-radius: 28px 28px 0 0;
        }
        .venue-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .venue-modal-tags {
          position: absolute;
          bottom: 14px;
          left: 18px;
          display: flex;
          gap: 8px;
        }
        .venue-modal-body {
          padding: 28px;
        }
        .venue-modal-kicker {
          font-size: 11px;
          font-weight: 800;
          color: #B0926A;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .venue-modal-title {
          font-family: 'Moul', serif;
          font-size: 20px;
          color: #1a1a1a;
          margin: 8px 0 20px;
          line-height: 1.5;
        }
        .venue-modal-meta-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          background: #faf7f2;
          padding: 16px;
          border-radius: 18px;
          margin-bottom: 24px;
          border: 1px solid rgba(176, 146, 106, 0.15);
        }
        .venue-modal-meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .venue-modal-meta-item .meta-icon {
          font-size: 22px;
        }
        .venue-modal-meta-item small {
          display: block;
          font-size: 11px;
          color: #888;
        }
        .venue-modal-meta-item strong {
          font-size: 14px;
          color: #222;
        }
        .venue-modal-actions {
          display: flex;
          gap: 12px;
        }
        .venue-modal-contact-btn {
          flex: 1;
          text-align: center;
          padding: 14px 20px;
          background: linear-gradient(135deg, #B0926A 0%, #7D6443 100%);
          color: #fff;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(176, 146, 106, 0.3);
          transition: 0.2s;
        }
        .venue-modal-contact-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .venue-modal-secondary-btn {
          padding: 14px 20px;
          background: #f1ede6;
          color: #555;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .venue-modal-secondary-btn:hover {
          background: #e5dfd5;
        }
      `})]})};function _(){return(0,p.jsx)(g,{})}export{_ as default};
//# sourceMappingURL=VenuesPage-BGllGSoE.js.map