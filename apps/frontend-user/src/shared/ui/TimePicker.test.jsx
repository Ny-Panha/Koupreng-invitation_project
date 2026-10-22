import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import TimePicker from './TimePicker';
import {useLanguageStore} from '@/stores/useLanguageStore';
afterEach(cleanup);
it('supports English keyboard selection, emits 24-hour time and restores focus',()=>{
 useLanguageStore.setState({lang:'en'});const change=vi.fn();
 const {container}=render(<TimePicker value='17:30' onChange={change}/>);const trigger=container.querySelector('.tp-trigger');
 fireEvent.click(trigger);expect(screen.getByRole('dialog',{name:'Choose time'})).toBeInTheDocument();
 const hour=screen.getByRole('button',{name:'Hour 05'});hour.focus();fireEvent.keyDown(hour,{key:'ArrowDown'});
 expect(screen.getByRole('button',{name:'Hour 06'})).toHaveFocus();
 fireEvent.click(screen.getByRole('button',{name:'Set time'}));expect(change).toHaveBeenCalledWith('18:30');expect(trigger).toHaveFocus();
 fireEvent.click(trigger);fireEvent.keyDown(document.activeElement,{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();expect(change).toHaveBeenCalledTimes(1);
});
