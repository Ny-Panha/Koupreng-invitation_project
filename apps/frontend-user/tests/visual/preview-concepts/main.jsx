// Isolated QA concept harness. Not imported by the application or production build.
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Modal from '../../../src/shared/ui/Modal';
import LivePhoneSimulator from '../../../src/features/invitations/LivePhoneSimulator';
import '../../../src/styles/index.css';
import '../../../src/features/invitations/studio/InvitationStudio.css';
import { useLanguageStore } from '../../../src/stores/useLanguageStore';
useLanguageStore.setState({lang:'en'});
export default function Concepts() {
  const thumbnail = new URLSearchParams(location.search).get('concept') === 'A';
  const [open,setOpen]=useState(false),[name,setName]=useState('Concept sample');
  const field=useRef(null),position=useRef(0);
  const data={templateId:'khmer-celestial',title:name,groomName:'Sample groom',brideName:'Sample bride'};
  const close=()=>{setOpen(false);requestAnimationFrame(()=>{field.current.focus({preventScroll:true});window.scrollTo({top:position.current,behavior:'instant'});});};
  return <main style={{maxWidth:540,padding:16,margin:'auto'}}>
    <p>QA prototype · synthetic invitation · no writes</p><h1>Concept {thumbnail?'A: inline thumbnail':'B: preview button'}</h1>
    {thumbnail && !open && <div style={{height:180,overflow:'hidden'}} aria-label="Live thumbnail"><div style={{width:600,height:900,transform:'scale(.2)',transformOrigin:'top center'}}><LivePhoneSimulator data={data}/></div></div>}
    <button type="button" style={{minHeight:44,padding:12,position:'sticky',top:0,zIndex:10,background:'white'}} onClick={()=>setOpen(true)}>Preview invitation</button>
    <p>Keep editing the invitation details below.</p>
    {Array.from({length:10},(_,i)=><label key={i} style={{display:'block',margin:'24px 0'}}>Detail {i+1}<input ref={i===7?field:null} value={i===7?name:undefined} onBlur={i===7?()=>{position.current=scrollY;}:undefined} onChange={i===7?e=>setName(e.target.value):undefined} style={{display:'block',width:'100%',minHeight:48,fontSize:16,border:'1px solid',marginTop:8}} /></label>)}
    {open && <Modal isOpen onClose={close} title="Invitation preview" closeLabel="Return to editing" size="full" className="studio-preview-sheet"><div className="pe-mobile-preview-drawer"><div className="pe-mobile-preview-drawer-body"><LivePhoneSimulator data={data} onRequestClose={close}/></div></div></Modal>}
  </main>;
}
createRoot(document.getElementById('root')).render(<Concepts/>);
