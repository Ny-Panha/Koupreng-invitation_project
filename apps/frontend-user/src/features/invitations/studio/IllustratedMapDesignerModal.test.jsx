import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { feedback } from '@/shared/feedback/feedback';
import IllustratedMapDesignerModal from './IllustratedMapDesignerModal';
import { blankMap } from '../../templates/shared/illustratedMapModel';

afterEach(()=>{cleanup();vi.restoreAllMocks();});
function Harness({ initial, onClose=vi.fn(), persist=async()=>true, allowed=true, locale='en' }){
  const [value,setValue]=useState(initial||blankMap()),[saved,setSaved]=useState(initial||blankMap());
  return <IllustratedMapDesignerModal value={value} onChange={setValue} savedValue={saved} locale={locale} allowed={allowed} onClose={onClose} onSave={async()=>{const ok=await persist();if(ok)setSaved(value);return ok;}}/>;
}
describe('Studio map designer',()=>{
  it.each([['en','វត្ត','Pagoda'],['km','school','សាលារៀន']])('finds a landmark across categories and languages in %s', (locale,query,name)=>{
    render(<Harness locale={locale}/>);
    fireEvent.change(screen.getByRole('searchbox'),{target:{value:query}});
    const library=screen.getByRole('complementary',{name:locale==='en'?'Element library':'បណ្ណាល័យធាតុ'});
    expect(library.querySelectorAll('.map-element-grid > button')).toHaveLength(1);
    fireEvent.click(within(library).getByRole('button',{name,exact:true}));
    expect(document.querySelector('.map-layer-list')).toHaveTextContent(name);
    fireEvent.change(screen.getByRole('searchbox'),{target:{value:'no-such-map-tool'}});
    expect(library.querySelectorAll('.map-element-grid > button')).toHaveLength(0);
    expect(document.querySelectorAll('.map-layer-list button')).toHaveLength(1);
  });
  it('keeps library searching out of the saved map and draft confirmation',()=>{
    const change=vi.fn(),close=vi.fn();
    render(<IllustratedMapDesignerModal value={blankMap()} onChange={change} locale="en" allowed onClose={close}/>);
    fireEvent.change(screen.getByRole('searchbox',{name:'Search elements'}),{target:{value:'hotel'}});
    fireEvent.click(screen.getByRole('button',{name:'Clear search'}));expect(screen.getByRole('searchbox',{name:'Search elements'})).toHaveFocus();
    expect(change).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Close designer'}));expect(close).toHaveBeenCalledOnce();
  });
  it('adds roads, intersections and roundabouts, edits both labels and moves with the keyboard',()=>{
    render(<Harness/>);
    fireEvent.click(screen.getByRole('button',{name:'Straight road',exact:true}));
    fireEvent.change(screen.getByLabelText('អក្សរខ្មែរ'),{target:{value:'ផ្លូវមង្គល'}});
    fireEvent.change(screen.getByLabelText('English label'),{target:{value:'Celebration road'}});
    const position=screen.getByLabelText('Position X');expect(position).toHaveValue(.5);
    fireEvent.keyDown(screen.getByRole('img',{name:'Illustrative venue diagram'}),{key:'ArrowRight'});
    expect(position).toHaveValue(.505);
    fireEvent.click(screen.getByRole('button',{name:'Cross intersection',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:'Roundabout',exact:true}));
    expect(screen.getByLabelText('Map properties').querySelectorAll('.map-layer-list button')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button',{name:'Duplicate',exact:true}));
    expect(screen.getByLabelText('Map properties').querySelectorAll('.map-layer-list button')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button',{name:'Delete',exact:true}));
    expect(screen.getByLabelText('Map properties').querySelectorAll('.map-layer-list button')).toHaveLength(3);
  });
  it('requires confirmation before replacing a nonempty design and before closing an unsaved draft',async()=>{
    const close=vi.fn(), confirm=vi.spyOn(feedback,'confirm').mockResolvedValue(false);
    render(<Harness onClose={close}/>);
    fireEvent.click(screen.getByRole('button',{name:'Straight road',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:'Presets',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:/Royal blue & gold/}));
    await waitFor(()=>expect(confirm).toHaveBeenCalled());
    expect(screen.getByLabelText('Map properties').querySelectorAll('.map-layer-list button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button',{name:'Close designer'}));await waitFor(()=>expect(confirm).toHaveBeenCalledTimes(2));expect(close).not.toHaveBeenCalled();
    confirm.mockResolvedValue(true);fireEvent.click(screen.getByRole('button',{name:/Royal blue & gold/}));
    await waitFor(()=>expect(screen.getByLabelText('Map properties').querySelectorAll('.map-layer-list button')).toHaveLength(7));
  });
  it('does not report save success until persistence confirms it',async()=>{
    let complete;const persist=vi.fn(()=>new Promise(resolve=>{complete=resolve;}));
    render(<Harness persist={persist}/>);fireEvent.click(screen.getByRole('button',{name:'Straight road',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:'Save design'}));
    expect(screen.queryByText('Saved to server')).not.toBeInTheDocument();
    complete(true);await waitFor(()=>expect(screen.getAllByText('Saved to server').length).toBeGreaterThan(0));
  });
  it('fails closed after access becomes unknown and keeps the current design visible',()=>{
    const initial={...blankMap(),nodes:[{id:'one',type:'road',x:.5,y:.5,width:.3,height:.04,rotation:0,label:{km:'ផ្លូវ',en:'Road'}}]};
    render(<Harness initial={initial} allowed={false}/>);
    expect(screen.getByRole('alert')).toHaveTextContent('Access is no longer verified');
    expect(screen.getByRole('button',{name:'Save design'})).toBeDisabled();
    expect(within(screen.getByRole('dialog')).queryByRole('button',{name:'Straight road',exact:true})).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
  it('allows closing with draft confirmation while a save is still pending',async()=>{
    let finish;const close=vi.fn();vi.spyOn(feedback,'confirm').mockResolvedValue(true);
    render(<Harness onClose={close} persist={()=>new Promise(resolve=>{finish=resolve;})}/>);
    fireEvent.click(screen.getByRole('button',{name:'Straight road',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Save design'}));
    fireEvent.click(screen.getByRole('button',{name:'Close designer'}));await waitFor(()=>expect(close).toHaveBeenCalledOnce());finish(false);
  });
});
