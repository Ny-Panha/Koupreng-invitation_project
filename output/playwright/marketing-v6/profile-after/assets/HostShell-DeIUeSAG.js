import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{A as r,An as i,C as a,En as o,On as s,P as c,St as l,Tn as u,U as d,V as f,_t as p,b as m,fn as h,h as g,ht as _,kn as v,l as y,tt as b}from"./index-FC8xx69x.js";import{t as x}from"./useBackendMessages-C8dAuOEY.js";import{t as S}from"./logo-CnrSq6bR.js";var C=e(t(),1),w=n(),T={km:{events:`កម្មវិធី`,dashboard:`ផ្ទាំងគ្រប់គ្រង`,guests:`បញ្ជីភ្ញៀវ`,expenses:`គម្រោងថវិកា`,gifts:`ចងដៃមង្គល`,packages:`កញ្ចប់សេវាកម្ម`,browseTemplates:`ស្វែងរកគំរូ`,myInvitation:`គម្រូធៀប`},en:{events:`Events`,dashboard:`Dashboard`,guests:`Guests`,expenses:`Budget`,gifts:`Gifts`,packages:`Packages`,browseTemplates:`Browse Templates`,myInvitation:`Invitation Template`}},E={km:{events:`កម្មវិធី`,dashboard:`ផ្ទាំងគ្រប់គ្រង`,guests:`បញ្ជីភ្ញៀវ`,expenses:`កម្រោងថវិកា`,gifts:`ចងដៃទទួល`,myInvitation:`កម្រងធៀប`,browseTemplates:`ស្វែងរកគំរូ`},en:{events:`App`,dashboard:`Dashboard Overview`,guests:`Guests`,expenses:`Budgeting`,gifts:`Gifts`,myInvitation:`My Templates / Invitations`,browseTemplates:`Browse Templates`}},D=[{code:`en`,label:`English`,buttonLabel:`English`,flag:`us`,htmlLang:`en`},{code:`km`,label:`ភាសាខ្មែរ`,buttonLabel:`ភាសាខ្មែរ`,flag:`kh`,htmlLang:`km`}];function O(e){if(!e)return``;try{let t=new URL(e);if(t.pathname.startsWith(`/uploads/`))return`${t.pathname}${t.search}${t.hash}`}catch{}return e}function k(){let[e,t]=(0,C.useState)(!1),[n,s]=(0,C.useState)(!1),[k,A]=(0,C.useState)(!1),j=u(e=>e.lang),M=u(e=>e.setLang),N=(0,C.useRef)(null),P=v(),F=i(),{logout:I,user:L}=h(),{text:R}=x(`hostNav`),z=D.find(e=>e.code===j)||D[1],B=L?.fullName?.trim()||L?.full_name?.trim()||L?.name?.trim()||L?.email?.split(`@`)[0]||R(`accountFallback`)||`គណនី`,V=O(L?.profileImage||L?.profile_image||L?.avatarUrl||L?.avatar_url||``),H=B.charAt(0)?.toUpperCase()||`K`;(0,C.useEffect)(()=>{let e=()=>t(window.scrollY>8);return window.addEventListener(`scroll`,e),()=>window.removeEventListener(`scroll`,e)},[]),(0,C.useEffect)(()=>{document.documentElement.lang=z.htmlLang},[z.htmlLang]),(0,C.useEffect)(()=>{let e=e=>{N.current&&!N.current.contains(e.target)&&A(!1)},t=e=>{e.key===`Escape`&&A(!1)};return document.addEventListener(`mousedown`,e),document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`mousedown`,e),document.removeEventListener(`keydown`,t)}},[]),(0,C.useEffect)(()=>(n?document.body.style.overflow=`hidden`:document.body.style.overflow=``,()=>{document.body.style.overflow=``}),[n]);let U=[{labelKey:`events`,path:`/dashboard/events`,Icon:y},{labelKey:`dashboard`,path:`/dashboard`,Icon:d},{labelKey:`guests`,path:`/dashboard/guests`,Icon:_},{labelKey:`expenses`,path:`/dashboard/expenses`,Icon:g},{labelKey:`gifts`,path:`/dashboard/gifts`,Icon:f},{labelKey:`myInvitation`,path:`/dashboard/invitations/design`,activePath:`/dashboard/invitations`,Icon:r},{labelKey:`browseTemplates`,path:`/templates/browse`,Icon:r}],W=e=>e===`/dashboard`?P.pathname===e:P.pathname===e||P.pathname.startsWith(`${e}/`),G=()=>{s(!1)},K=e=>{let t=E[j]?.[e];if(t)return t;if(e===`browseTemplates`)return j===`en`?`Browse Templates`:`ស្វែងរកគំរូ`;if(e===`myInvitation`)return j===`en`?`Invitation Template`:`គម្រូធៀប`;let n=R(e);return n&&n!==e&&n!==`hostNav.${e}`?n:T[j]?.[e]||T.km[e]||e},q=()=>{G(),I(),F(`/`,{replace:!0})},J=e=>{M(e.code)};return(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`style`,{children:`
        :root {
          --site-header-offset: clamp(104px, 8vw, 132px);
          --host-nav-offset: clamp(104px, 8vw, 132px);
        }
        @media (max-width: 768px) {
          :root {
            --site-header-offset: 96px;
            --host-nav-offset: 96px;
          }
        }
        .host-header-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 3000;
          padding: ${e?`10px 0`:`18px 0`};
          transition: all 0.3s ease;
          pointer-events: none;
          background: ${e?`rgba(251, 246, 238, 0.94)`:`transparent`};
          backdrop-filter: ${e?`blur(14px)`:`none`};
          -webkit-backdrop-filter: ${e?`blur(14px)`:`none`};
          border-bottom: ${e?`1px solid rgba(176, 146, 106, 0.2)`:`1px solid transparent`};
          box-shadow: ${e?`0 4px 20px rgba(42, 31, 16, 0.05)`:`none`};
        }
        .host-header-container {
          pointer-events: auto;
          max-width: 1440px;
          margin: 0 auto;
          width: 92%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          height: 75px;
          background: ${e?`rgba(252, 248, 242, 0.95)`:`rgba(252, 248, 242, 0.4)`};
          backdrop-filter: blur(5px);
          border-radius: 50px;
          border: 1px solid rgba(176, 146, 106, 0.3);
          box-shadow: ${e?`0 10px 40px rgba(0,0,0,0.1)`:`none`};
        }
        .host-logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
          transition: transform 0.25s ease;
        }
        .host-logo-box:hover {
          transform: scale(1.05);
        }
        .host-logo-box img {
          height: 90px;
          width: auto;
          object-fit: contain;
          transition: filter 0.25s ease;
        }
        .host-logo-box:hover img {
          filter: drop-shadow(0 4px 12px rgba(176, 146, 106, 0.45));
        }
        .host-logo-tip {
          position: absolute;
          left: 50%;
          top: 100%;
          transform: translate(-50%, 6px);
          white-space: nowrap;
          background: #7D6443;
          color: #fff;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
          box-shadow: 0 6px 18px rgba(0,0,0,0.18);
          z-index: 10;
        }
        .host-logo-tip::before {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 100%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-bottom-color: #7D6443;
        }
        .host-logo-box:hover .host-logo-tip,
        .host-logo-box:focus-visible .host-logo-tip {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 10px);
        }
        .host-nav-links {
          display: flex;
          flex: 1;
          gap: 5px;
          align-items: center;
          justify-content: center;
          min-width: 0;
          white-space: nowrap;
        }
        .host-nav-item-wrap {
          display: flex;
          align-items: center;
          gap: 5px;
          flex: 0 0 auto;
        }
        .host-nav-divider {
          color: #ccc;
          font-size: 13px;
          white-space: nowrap;
          font-weight: 300;
          user-select: none;
        }
        .host-nav-link {
          font-family: 'Kantumruy Pro', sans-serif;
          text-decoration: none;
          color: #333;
          font-weight: 700;
          font-size: 14px;
          transition: 0.3s;
          background: none;
          border: 0;
          cursor: pointer;
          padding: 0;
        }
        .host-nav-link:hover,
        .host-nav-link.active {
          color: #B0926A;
        }
        .host-user-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .host-language-selector {
          position: relative;
          z-index: 20;
        }
        .host-language-btn {
          height: 44px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          border: 1px solid rgba(176, 146, 106, 0.24);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: #1f1f1f;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(93, 67, 32, 0.08);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .host-language-btn:hover,
        .host-language-btn.open {
          background: #fff;
          border-color: rgba(176, 146, 106, 0.48);
          box-shadow: 0 10px 28px rgba(93, 67, 32, 0.12);
        }
        .host-language-btn svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .host-language-chevron {
          width: 14px !important;
          height: 14px !important;
          color: #7D6443;
        }
        .host-language-menu {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 164px;
          padding: 10px;
          border: 1px solid rgba(176, 146, 106, 0.16);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 42px rgba(42, 31, 16, 0.16);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .host-language-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border: none;
          border-radius: 12px;
          background: transparent;
          color: #222;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .host-language-option:hover,
        .host-language-option.active {
          background: rgba(176, 146, 106, 0.1);
          color: #7D6443;
        }
        .host-language-option-label {
          flex: 1;
        }
        .host-language-check {
          width: 16px !important;
          height: 16px !important;
          color: #e11d48;
        }
        .host-language-flag {
          width: 26px;
          height: 18px;
          border-radius: 3px;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
          overflow: hidden;
          position: relative;
        }
        .host-language-flag.us {
          background:
            linear-gradient(#3c3b6e 0 54%, transparent 54%),
            repeating-linear-gradient(
              to bottom,
              #b22234 0 7.69%,
              #fff 7.69% 15.38%
            );
          background-size: 42% 54%, 100% 100%;
          background-repeat: no-repeat, repeat;
          background-position: left top, center;
        }
        .host-language-flag.kh {
          background: linear-gradient(
            to bottom,
            #032ea1 0 25%,
            #e00025 25% 75%,
            #032ea1 75% 100%
          );
        }
        .host-language-flag.kh::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 5px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          border-top-width: 2px;
          transform: translate(-50%, -50%);
        }
        .host-profile-pill {
          min-width: 0;
          height: 44px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 4px;
          border-radius: 999px;
          color: #1f1f1f;
          text-decoration: none;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 14px;
          font-weight: 800;
          transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
        }
        .host-profile-pill:hover,
        .host-profile-pill.open {
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 8px 24px rgba(93, 67, 32, 0.08);
          border-color: rgba(176, 146, 106, 0.24);
        }
        .host-profile-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #B0926A;
          border: 2px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 14px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 6px 16px rgba(93, 67, 32, 0.14);
        }
        .host-profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .host-profile-name {
          max-width: 96px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .host-profile-selector {
          position: relative;
          z-index: 20;
        }
        .host-profile-chevron {
          width: 14px !important;
          height: 14px !important;
          color: #7D6443;
          margin-left: 2px;
        }
        .host-profile-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 180px;
          padding: 10px;
          border: 1px solid rgba(176, 146, 106, 0.16);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 42px rgba(42, 31, 16, 0.16);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .host-profile-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 12px;
          border: none;
          border-radius: 12px;
          background: transparent;
          color: #222;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .host-profile-menu-item:hover {
          background: rgba(176, 146, 106, 0.1);
          color: #7D6443;
        }
        .host-profile-menu-item.logout {
          color: #e11d48;
        }
        .host-profile-menu-item.logout:hover {
          background: rgba(225, 29, 72, 0.08);
        }
        .host-profile-menu-item svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        /* Hamburger button - hidden on desktop */
        .host-hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 3100;
        }
        .host-hamburger-btn span {
          display: block;
          width: 24px;
          height: 3px;
          background: #333;
          border-radius: 3px;
          transition: 0.3s;
          margin: 5px 0;
        }
        .host-hamburger-btn.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 6px);
        }
        .host-hamburger-btn.open span:nth-child(2) {
          opacity: 0;
        }
        .host-hamburger-btn.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -6px);
        }

        /* Mobile overlay */
        .host-mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          z-index: 2999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .host-mobile-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile slide menu */
        .host-mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          right: -100%;
          width: 260px;
          height: 100%;
          background: rgba(252, 248, 242, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 3100;
          padding: 100px 24px 40px;
          transition: right 0.3s ease;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
          pointer-events: none;
        }
        .host-mobile-menu.open {
          right: 0;
          pointer-events: auto;
        }
        .host-mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 12px;
          text-decoration: none;
          color: #333;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 600;
          font-size: 16px;
          border-radius: 12px;
          transition: 0.2s;
        }
        .host-mobile-menu-item:hover,
        .host-mobile-menu-item.active {
          background: rgba(176, 146, 106, 0.12);
          color: #B0926A;
        }
        .host-mobile-menu-item .menu-icon {
          font-size: 22px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(176, 146, 106, 0.1);
          border-radius: 10px;
        }
        .host-mobile-menu-item .menu-icon svg,
        .host-mobile-logout-btn .menu-icon svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }
        .host-mobile-menu-divider {
          height: 1px;
          background: rgba(176, 146, 106, 0.2);
          margin: 16px 0;
        }
        .host-mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 12px;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: #8a3434;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 12px;
          width: 100%;
          transition: 0.2s;
        }
        .host-mobile-logout-btn:hover {
          background: rgba(138, 52, 52, 0.08);
        }
        .host-mobile-logout-btn .menu-icon {
          font-size: 22px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(138, 52, 52, 0.08);
          border-radius: 10px;
        }

        @media (max-width: 1200px) {
          .host-nav-links {
            display: none;
          }
          .host-language-label,
          .host-profile-name,
          .host-profile-chevron {
            display: none;
          }
          .host-language-btn,
          .host-profile-pill {
            width: 44px;
            justify-content: center;
            padding: 0;
          }
          .host-language-chevron {
            display: none;
          }
          .host-hamburger-btn {
            display: block;
          }
          .host-mobile-overlay,
          .host-mobile-menu {
            display: block;
          }
        }
        @media (max-width: 768px) {
          .host-header-wrapper {
            padding: 8px 0;
            background: rgba(251, 246, 238, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(176, 146, 106, 0.2);
            box-shadow: 0 4px 16px rgba(42, 31, 16, 0.06);
          }
          .host-header-container {
            width: calc(100% - 20px);
            padding: 0 14px;
            height: 58px;
            background: rgba(255, 255, 255, 0.96);
            border-radius: 999px;
            border: 1px solid rgba(176, 146, 106, 0.25);
            box-shadow: 0 2px 8px rgba(42, 31, 16, 0.05);
          }
          .host-logo-box img {
            height: 52px;
          }
          .host-nav-links {
            display: none;
          }
          .host-logout-nav-btn {
            display: none;
          }
          .host-profile-pill {
            padding: 0;
          }
          .host-hamburger-btn {
            display: block;
          }
          .host-mobile-overlay {
            display: block;
          }
          .host-mobile-menu {
            display: block;
          }
        }
        @media (max-width: 420px) {
          .host-user-actions {
            gap: 8px;
          }
          .host-language-btn,
          .host-profile-avatar {
            width: 38px;
            height: 38px;
          }
          .host-language-menu {
            left: auto;
            right: 0;
          }
        }
      `}),(0,w.jsx)(`div`,{className:`host-header-wrapper`,children:(0,w.jsxs)(`header`,{className:`host-header-container`,children:[(0,w.jsxs)(o,{to:`/`,className:`host-logo-box`,"aria-label":`Koupreng — ${R(`backToDashboard`)||`Back to dashboard`}`,children:[(0,w.jsx)(`img`,{src:S,alt:`Koupreng`}),(0,w.jsx)(`span`,{className:`host-logo-tip`,role:`tooltip`,children:R(`backToDashboard`)||`Back to dashboard`})]}),(0,w.jsx)(`nav`,{className:`host-nav-links`,"aria-label":j===`en`?`Main navigation`:`ម៉ឺនុយចម្បង`,children:U.map((e,t)=>(0,w.jsxs)(`span`,{className:`host-nav-item-wrap`,children:[t>0&&(0,w.jsx)(`span`,{className:`host-nav-divider`,children:`|`}),(0,w.jsx)(o,{to:e.path,className:`host-nav-link${W(e.activePath||e.path)?` active`:``}`,children:K(e.labelKey)})]},e.labelKey))}),(0,w.jsxs)(`div`,{className:`host-user-actions`,children:[(0,w.jsxs)(`div`,{className:`host-profile-selector`,ref:N,children:[(0,w.jsxs)(`button`,{type:`button`,className:`host-profile-pill${k?` open`:``}`,"aria-haspopup":`menu`,"aria-expanded":k,onClick:()=>A(e=>!e),children:[(0,w.jsx)(`span`,{className:`host-profile-avatar`,children:V?(0,w.jsx)(`img`,{src:V,alt:``}):H}),(0,w.jsx)(`span`,{className:`host-profile-name`,children:B}),(0,w.jsx)(a,{className:`host-profile-chevron`,"aria-hidden":`true`})]}),k&&(0,w.jsxs)(`div`,{className:`host-profile-menu`,role:`menu`,children:[(0,w.jsxs)(o,{to:`/dashboard/profile`,className:`host-profile-menu-item`,onClick:()=>A(!1),role:`menuitem`,children:[(0,w.jsx)(p,{"aria-hidden":`true`}),(0,w.jsx)(`span`,{children:L?.fullName?.trim()||L?.full_name?.trim()?R(`editProfile`):R(`createProfile`)})]}),(0,w.jsxs)(o,{to:`/dashboard/packages`,className:`host-profile-menu-item`,onClick:()=>A(!1),role:`menuitem`,children:[(0,w.jsx)(c,{"aria-hidden":`true`,style:{color:`#B0926A`}}),(0,w.jsx)(`span`,{children:K(`packages`)})]}),(0,w.jsxs)(o,{to:`/dashboard/templates/paid`,className:`host-profile-menu-item`,onClick:()=>A(!1),role:`menuitem`,children:[(0,w.jsx)(c,{"aria-hidden":`true`,style:{color:`#B0926A`}}),(0,w.jsx)(`span`,{children:j===`en`?`Paid Templates`:`គំរូដែលបានទិញ`})]}),(0,w.jsxs)(o,{to:`/dashboard/payments`,className:`host-profile-menu-item`,onClick:()=>A(!1),role:`menuitem`,children:[(0,w.jsx)(l,{"aria-hidden":`true`}),(0,w.jsx)(`span`,{children:j===`en`?`Payment History`:`ប្រវត្តិការទូទាត់`})]}),(0,w.jsxs)(o,{to:`/dashboard/reports`,className:`host-profile-menu-item`,onClick:()=>A(!1),role:`menuitem`,children:[(0,w.jsx)(l,{"aria-hidden":`true`,style:{color:`#B0926A`}}),(0,w.jsx)(`span`,{children:j===`en`?`Financial Reports`:`របាយការណ៍ហិរញ្ញវត្ថុ`})]}),(0,w.jsx)(`div`,{style:{height:`1px`,background:`rgba(176, 146, 106, 0.2)`,margin:`8px 0`}}),(0,w.jsx)(`div`,{style:{padding:`4px 12px`,fontSize:`12px`,fontWeight:`700`,color:`#888`,textTransform:`uppercase`},children:R(`language`)||`Language`}),D.map(e=>(0,w.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`host-profile-menu-item${e.code===z.code?` active`:``}`,onClick:()=>J(e),style:{padding:`8px 12px`},children:[(0,w.jsx)(`span`,{className:`host-language-flag ${e.flag}`,"aria-hidden":`true`,style:{width:`22px`,height:`15px`}}),(0,w.jsx)(`span`,{style:{flex:1,textAlign:`left`},children:e.label}),e.code===z.code&&(0,w.jsx)(m,{"aria-hidden":`true`,style:{color:`#B0926A`}})]},e.code)),(0,w.jsx)(`div`,{style:{height:`1px`,background:`rgba(176, 146, 106, 0.2)`,margin:`8px 0`}}),(0,w.jsxs)(`button`,{type:`button`,className:`host-profile-menu-item logout`,onClick:q,role:`menuitem`,children:[(0,w.jsx)(b,{"aria-hidden":`true`}),(0,w.jsx)(`span`,{children:R(`logout`)})]})]})]}),(0,w.jsxs)(`button`,{type:`button`,className:`host-hamburger-btn${n?` open`:``}`,onClick:()=>s(!n),"aria-label":`បើកម៉ឺនុយ`,children:[(0,w.jsx)(`span`,{}),(0,w.jsx)(`span`,{}),(0,w.jsx)(`span`,{})]})]})]})}),(0,w.jsx)(`div`,{className:`host-mobile-overlay${n?` visible`:``}`,onClick:()=>s(!1)}),(0,w.jsxs)(`nav`,{className:`host-mobile-menu${n?` open`:``}`,"aria-label":j===`en`?`Main navigation`:`ម៉ឺនុយចម្បង`,children:[(0,w.jsxs)(o,{to:`/dashboard/profile`,className:`host-mobile-menu-item${W(`/dashboard/profile`)?` active`:``}`,style:{marginBottom:8},onClick:G,children:[(0,w.jsx)(`span`,{className:`menu-icon`,children:(0,w.jsx)(p,{"aria-hidden":`true`})}),L?.fullName?.trim()||L?.full_name?.trim()?R(`editProfile`):R(`createProfile`)]}),(0,w.jsx)(`div`,{className:`host-mobile-menu-divider`}),U.map(e=>{let t=e.Icon;return(0,w.jsxs)(o,{to:e.path,className:`host-mobile-menu-item${W(e.activePath||e.path)?` active`:``}`,onClick:G,children:[(0,w.jsx)(`span`,{className:`menu-icon`,children:(0,w.jsx)(t,{"aria-hidden":`true`})}),K(e.labelKey)]},e.labelKey)}),(0,w.jsx)(`div`,{className:`host-mobile-menu-divider`}),(0,w.jsxs)(o,{to:`/dashboard/templates/paid`,className:`host-mobile-menu-item${W(`/dashboard/templates/paid`)?` active`:``}`,onClick:G,children:[(0,w.jsx)(`span`,{className:`menu-icon`,children:(0,w.jsx)(c,{"aria-hidden":`true`,style:{color:`#B0926A`}})}),(0,w.jsx)(`span`,{children:j===`en`?`Paid Templates`:`គំរូដែលបានទិញ`})]}),(0,w.jsxs)(o,{to:`/dashboard/payments`,className:`host-mobile-menu-item${W(`/dashboard/payments`)?` active`:``}`,onClick:G,children:[(0,w.jsx)(`span`,{className:`menu-icon`,children:(0,w.jsx)(l,{"aria-hidden":`true`})}),(0,w.jsx)(`span`,{children:j===`en`?`Payment History`:`ប្រវត្តិការទូទាត់`})]}),(0,w.jsxs)(o,{to:`/dashboard/reports`,className:`host-mobile-menu-item${W(`/dashboard/reports`)?` active`:``}`,onClick:G,children:[(0,w.jsx)(`span`,{className:`menu-icon`,children:(0,w.jsx)(l,{"aria-hidden":`true`,style:{color:`#B0926A`}})}),(0,w.jsx)(`span`,{children:j===`en`?`Financial Reports`:`របាយការណ៍ហិរញ្ញវត្ថុ`})]}),(0,w.jsxs)(`button`,{type:`button`,className:`host-mobile-logout-btn`,onClick:q,children:[(0,w.jsx)(`span`,{className:`menu-icon`,children:(0,w.jsx)(b,{"aria-hidden":`true`})}),R(`logout`)]})]})]})}function A(){return v().pathname.endsWith(`/preview`)?(0,w.jsx)(s,{}):(0,w.jsxs)(`div`,{className:`dash-wrapper`,children:[(0,w.jsx)(k,{}),(0,w.jsx)(`div`,{className:`dash-main-scroll`,children:(0,w.jsx)(s,{})})]})}export{A as default};
//# sourceMappingURL=HostShell-DeIUeSAG.js.map