import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{t as r}from"./httpClient-oM6DHhph.js";import{P as i,rt as a}from"./index-DWR6E2Wk.js";import{t as o}from"./SocialAuthButtons-DTsXPTUO.js";var s=e(t(),1),c={getProfile:()=>r.get(`/users/me`),updateProfile:e=>r.patch(`/users/me`,e),uploadProfileImage:e=>{let t=new FormData;return t.append(`file`,e),r.post(`/users/me/profile-image`,t)},changePassword:(e,t)=>r.post(`/users/me/change-password`,{currentPassword:e,newPassword:t})},l=n();function u(){let{text:e}=i(`profile`),{user:t,logout:n,updateUser:r}=a(),[u,d]=(0,s.useState)(``),[f,p]=(0,s.useState)(``),[m,h]=(0,s.useState)(``),[g,_]=(0,s.useState)(null),[v,y]=(0,s.useState)(``),[b,x]=(0,s.useState)(!0),[S,C]=(0,s.useState)(!1),[w,T]=(0,s.useState)(!1),[E,D]=(0,s.useState)(``),O=e=>(e||``).replace(/^https?:\/\/localhost(:\d+)?/,``),[k,A]=(0,s.useState)(!1),[j,M]=(0,s.useState)(``),[N,P]=(0,s.useState)(``),[F,I]=(0,s.useState)(``),[L,R]=(0,s.useState)(!1),[z,B]=(0,s.useState)(!1),[V,H]=(0,s.useState)(``),U=!!(t?.fullName?.trim()||t?.full_name?.trim());(0,s.useEffect)(()=>{async function e(){try{let e=await c.getProfile();d(e.fullName||e.full_name||``),p(e.phone||``),h(O(e.profileImage||e.profile_image||``))}catch{d(t?.fullName||t?.full_name||t?.name||``),p(t?.phone||``),h(O(t?.profileImage||t?.profile_image||``))}finally{x(!1)}}e()},[t]);let W=e=>{let t=e.target.files?.[0];if(t){_(t);let e=new FileReader;e.onloadend=()=>y(e.result),e.readAsDataURL(t)}},G=async n=>{n.preventDefault(),C(!0),D(``),T(!1);try{let e=m;if(g){let t=await c.uploadProfileImage(g);e=t.url||t.profileImage||t.profile_image||e}let n={fullName:u.trim(),phone:f.trim(),profileImage:e},i=await c.updateProfile(n);r({...t,fullName:u.trim(),full_name:u.trim(),name:u.trim(),phone:f.trim(),profileImage:e,profile_image:e,profileComplete:!0,...i}),h(e),_(null),y(``),T(!0),setTimeout(()=>T(!1),3e3)}catch(t){D(t.message||e(`saveFailed`))}finally{C(!1)}},K=async t=>{if(t.preventDefault(),H(``),B(!1),N!==F){H(e(`passwordMismatch`));return}if(N.length<8){H(e(`passwordTooShort`));return}R(!0);try{await c.changePassword(j,N),B(!0),M(``),P(``),I(``),setTimeout(()=>n(),2e3)}catch(t){H(t.message||e(`passwordChangeFailed`))}finally{R(!1)}},q=v||m,J=u?.charAt(0)?.toUpperCase()||t?.email?.charAt(0)?.toUpperCase()||`?`;return b?(0,l.jsx)(`div`,{style:{textAlign:`center`,padding:`80px 20px`,fontFamily:`'Kantumruy Pro', sans-serif`,color:`#888`},children:e(`loading`)}):(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`style`,{children:`
        .profile-page {
          max-width: 520px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .profile-page h1 {
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 24px;
          color: #333;
          margin-bottom: 8px;
        }
        .profile-page .subtitle {
          font-family: 'Kantumruy Pro', sans-serif;
          color: #888;
          font-size: 14px;
          margin-bottom: 32px;
        }
        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }
        .profile-avatar {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #B0926A;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: bold;
          overflow: hidden;
          border: 3px solid rgba(176, 146, 106, 0.3);
          cursor: pointer;
          flex-shrink: 0;
        }
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-avatar-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.5);
          color: white;
          font-size: 10px;
          text-align: center;
          padding: 4px 0;
          font-family: 'Kantumruy Pro', sans-serif;
        }
        .profile-avatar input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .profile-info-text {
          font-family: 'Kantumruy Pro', sans-serif;
        }
        .profile-info-text strong {
          display: block;
          font-size: 16px;
          color: #333;
        }
        .profile-info-text span {
          color: #888;
          font-size: 13px;
        }
        .profile-form-group {
          margin-bottom: 20px;
        }
        .profile-form-group label {
          display: block;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #555;
          margin-bottom: 8px;
        }
        .profile-form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid rgba(176, 146, 106, 0.3);
          border-radius: 12px;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 15px;
          background: #fff;
          transition: 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .profile-form-group input:focus {
          border-color: #B0926A;
          box-shadow: 0 0 0 3px rgba(176, 146, 106, 0.1);
        }
        .profile-form-group input:disabled {
          background: #f5f5f5;
          color: #999;
        }
        .profile-save-btn {
          width: 100%;
          padding: 16px;
          background: #B0926A;
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 12px;
        }
        .profile-save-btn:hover {
          background: #9a7d5a;
        }
        .profile-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .profile-msg {
          text-align: center;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 14px;
          margin-top: 12px;
          animation: profileFadeIn 0.3s;
        }
        .profile-msg.success { color: #2e7d32; }
        .profile-msg.error   { color: #c62828; }

        /* ── Password section ───────────────────────────────────────────────── */
        .profile-section-divider {
          border: none;
          border-top: 1px solid rgba(176, 146, 106, 0.2);
          margin: 36px 0 0;
        }
        .profile-pw-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          padding: 18px 0 0;
          cursor: pointer;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #333;
          text-align: left;
        }
        .profile-pw-toggle svg {
          transition: transform 0.25s;
          flex-shrink: 0;
        }
        .profile-pw-toggle.open svg {
          transform: rotate(180deg);
        }
        .profile-pw-section {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .profile-pw-section.open {
          max-height: 600px;
          opacity: 1;
        }
        .profile-pw-hint {
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 13px;
          color: #888;
          margin: 6px 0 20px;
        }
        .profile-pw-btn {
          width: 100%;
          padding: 14px;
          background: transparent;
          color: #B0926A;
          border: 2px solid #B0926A;
          border-radius: 12px;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 4px;
        }
        .profile-pw-btn:hover {
          background: #B0926A;
          color: #fff;
        }
        .profile-pw-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes profileFadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}),(0,l.jsxs)(`div`,{className:`profile-page`,children:[(0,l.jsx)(`h1`,{children:e(U?`editTitle`:`createTitle`)}),(0,l.jsx)(`p`,{className:`subtitle`,children:e(U?`editSubtitle`:`createSubtitle`)}),(0,l.jsxs)(`div`,{className:`profile-avatar-section`,children:[(0,l.jsxs)(`div`,{className:`profile-avatar`,children:[q?(0,l.jsx)(`img`,{src:q,alt:`Profile`}):J,(0,l.jsx)(`div`,{className:`profile-avatar-overlay`,children:e(`changePhoto`)}),(0,l.jsx)(`input`,{type:`file`,accept:`image/*`,onChange:W,title:e(`selectImage`)})]}),(0,l.jsxs)(`div`,{className:`profile-info-text`,children:[(0,l.jsx)(`strong`,{children:u||e(`newUser`)}),(0,l.jsx)(`span`,{children:t?.email||``})]})]}),(0,l.jsxs)(`form`,{onSubmit:G,children:[(0,l.jsxs)(`div`,{className:`profile-form-group`,children:[(0,l.jsx)(`label`,{children:e(`fullNameLabel`)}),(0,l.jsx)(`input`,{type:`text`,value:u,onChange:e=>d(e.target.value),placeholder:e(`fullNamePlaceholder`),required:!0})]}),(0,l.jsxs)(`div`,{className:`profile-form-group`,children:[(0,l.jsx)(`label`,{children:e(`emailLabel`)}),(0,l.jsx)(`input`,{type:`email`,value:t?.email||``,disabled:!0,title:e(`emailReadonly`)})]}),(0,l.jsxs)(`div`,{className:`profile-form-group`,children:[(0,l.jsx)(`label`,{children:e(`phoneLabel`)}),(0,l.jsx)(`input`,{type:`tel`,value:f,onChange:e=>p(e.target.value),placeholder:e(`phonePlaceholder`)})]}),(0,l.jsx)(`button`,{type:`submit`,className:`profile-save-btn`,disabled:S||!u.trim(),children:e(S?`saving`:U?`saveEdit`:`createBtn`)}),w&&(0,l.jsx)(`p`,{className:`profile-msg success`,children:e(`savedSuccess`)}),E&&(0,l.jsx)(`p`,{className:`profile-msg error`,children:E})]}),(0,l.jsx)(`hr`,{className:`profile-section-divider`}),(0,l.jsxs)(`section`,{"aria-labelledby":`profile-linked-identities`,children:[(0,l.jsx)(`h2`,{id:`profile-linked-identities`,children:`Linked sign-in identities`}),(0,l.jsx)(o,{mode:`link`})]}),(0,l.jsx)(`hr`,{className:`profile-section-divider`}),(0,l.jsxs)(`button`,{type:`button`,className:`profile-pw-toggle${k?` open`:``}`,onClick:()=>A(e=>!e),"aria-expanded":k,children:[(0,l.jsx)(`span`,{children:e(`changePassword`)}),(0,l.jsx)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`#B0926A`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,l.jsx)(`polyline`,{points:`6 9 12 15 18 9`})})]}),(0,l.jsxs)(`div`,{className:`profile-pw-section${k?` open`:``}`,children:[(0,l.jsx)(`p`,{className:`profile-pw-hint`,children:e(`changePasswordHint`)}),(0,l.jsxs)(`form`,{onSubmit:K,children:[(0,l.jsxs)(`div`,{className:`profile-form-group`,children:[(0,l.jsx)(`label`,{children:e(`currentPassword`)}),(0,l.jsx)(`input`,{type:`password`,value:j,onChange:e=>M(e.target.value),placeholder:`••••••••`,required:!0,autoComplete:`current-password`})]}),(0,l.jsxs)(`div`,{className:`profile-form-group`,children:[(0,l.jsx)(`label`,{children:e(`newPasswordLabel`)}),(0,l.jsx)(`input`,{type:`password`,value:N,onChange:e=>P(e.target.value),placeholder:`••••••••`,required:!0,minLength:8,autoComplete:`new-password`})]}),(0,l.jsxs)(`div`,{className:`profile-form-group`,children:[(0,l.jsx)(`label`,{children:e(`confirmNewPassword`)}),(0,l.jsx)(`input`,{type:`password`,value:F,onChange:e=>I(e.target.value),placeholder:`••••••••`,required:!0,autoComplete:`new-password`})]}),(0,l.jsx)(`button`,{type:`submit`,className:`profile-pw-btn`,disabled:L||!j||!N||!F,children:e(L?`changingPassword`:`changePasswordBtn`)}),z&&(0,l.jsx)(`p`,{className:`profile-msg success`,children:e(`passwordChanged`)}),V&&(0,l.jsx)(`p`,{className:`profile-msg error`,children:V})]})]})]})]})}function d(){return(0,l.jsx)(u,{})}export{d as default};
//# sourceMappingURL=ProfilePage-kWuAyCbk.js.map