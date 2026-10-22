import {render,screen,cleanup} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {afterEach,expect,it} from 'vitest';
import WeddingSite from './WeddingSite';
import {useLanguageStore} from '@/stores/useLanguageStore';
afterEach(cleanup);
it('recovers from unknown preview identities without mounting a substitute renderer',()=>{
 useLanguageStore.setState({lang:'en'});
 const {container}=render(<MemoryRouter initialEntries={['/templates/missing-template/preview']}><Routes><Route path='/templates/:id/preview' element={<WeddingSite/>}/></Routes></MemoryRouter>);
 expect(screen.getByRole('heading',{name:'Template unavailable'})).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Browse templates'})).toHaveAttribute('href','/templates');
 expect(container.querySelector('[data-template-renderer]')).toBeNull();
});
