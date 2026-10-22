import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import Checkout from './TemplateCheckoutPage';
import {templateCatalogService} from '@/features/templates/api/templateCatalogApi';
import {paymentService} from './paymentService';
import {useLanguageStore} from '@/stores/useLanguageStore';
vi.mock('@/features/templates/api/templateCatalogApi',()=>({templateCatalogService:{list:vi.fn()}}));
vi.mock('./paymentService',()=>({paymentService:{createStaticPaymentOrder:vi.fn()}}));
const template={id:2,code:'garden-royal-khmer-wedding',name:'Approved design',checkoutEligible:true,checkoutAmount:'37.50',checkoutCurrency:'USD'};
const show=()=>render(<MemoryRouter initialEntries={['/templates/garden-royal-khmer-wedding/checkout']}><Routes><Route path='/templates/:templateId/checkout' element={<Checkout/>}/><Route path='/payments/:code/status' element={<p>Confirmed order route</p>}/></Routes></MemoryRouter>);
afterEach(cleanup);
beforeEach(()=>{vi.clearAllMocks();useLanguageStore.setState({lang:'en'});templateCatalogService.list.mockResolvedValue([template]);});
it('shows only the approved server offer and creates its exact template order',async()=>{
 paymentService.createStaticPaymentOrder.mockResolvedValue({orderCode:'FIXTURE-ORDER',templateId:2,status:'PENDING',amount:'37.50',currency:'USD'});
 show();await screen.findByText('$37.50');
 expect(screen.queryByText(/\$0\.01|VAT|100%|Unlimited|Test Payment|Included Features/)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Create payment order'}));
 await screen.findByText('Confirmed order route');
 expect(paymentService.createStaticPaymentOrder).toHaveBeenCalledWith(expect.objectContaining({templateId:2,amount:'37.50',currency:'USD'}));
});
it('does not synthesize the historical offer when eligibility fields are absent',async()=>{
 templateCatalogService.list.mockResolvedValue([{id:2,code:template.code,name:template.name,price:19}]);show();
 await screen.findByText('Current offer unavailable');expect(screen.getByRole('button',{name:'Create payment order'})).toBeDisabled();
 expect(paymentService.createStaticPaymentOrder).not.toHaveBeenCalled();
});
it('rejects an unconfirmed create response without inventing a status or navigating',async()=>{
 paymentService.createStaticPaymentOrder.mockResolvedValue({});show();await screen.findByText('$37.50');
 fireEvent.click(screen.getByRole('button',{name:'Create payment order'}));
 await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('server did not confirm'));
 expect(screen.queryByText('Confirmed order route')).toBeNull();
});
