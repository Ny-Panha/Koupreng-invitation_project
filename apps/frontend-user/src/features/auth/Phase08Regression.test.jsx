import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChangePassword from './ChangePasswordFeature';
import ResetPassword from './ResetPasswordFeature';
import ForgotPassword from './ForgotPasswordFeature';
import Profile from './ProfileFeature';
import authService from './api/authApi';
import { userService } from './api/userApi';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { safeAuthRedirect } from './safeRedirect';
import { isAccountPasswordValid } from './accountPasswordPolicy';
import { useAuthStore } from '../../stores/useAuthStore';

const mocks = vi.hoisted(() => ({ logout: vi.fn(), updateUser: vi.fn(), user: { id: 77, role: 'USER', fullName: 'Fictional Host', email: 'host@example.invalid' } }));
vi.mock('./hooks/useAuth', () => ({ useAuth: () => ({ user: mocks.user, logout: mocks.logout, updateUser: mocks.updateUser }) }));
vi.mock('./components/SocialAuthButtons', () => ({ default: () => null }));
vi.mock('./api/authApi', () => ({ default: { changePassword: vi.fn(), resetPassword: vi.fn(), forgotPassword: vi.fn() } }));
vi.mock('./api/userApi', () => ({ userService: { getProfile: vi.fn(), updateProfile: vi.fn(), uploadProfileImage: vi.fn(), changePassword: vi.fn() } }));

function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname + location.search}</output>; }
function open(element, path = '/') { return render(<MemoryRouter initialEntries={[path]}>{element}<Location /></MemoryRouter>); }
function change(label, value) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }
function fillPassword(value = 'newsecret123') {
  change(/Current password/i, 'oldsecret123'); change(/^New password/i, value); change(/Confirm new password/i, value);
}
beforeEach(() => {
  vi.clearAllMocks(); useLanguageStore.getState().setLang('en');
  mocks.user = { id:77,role:'USER',fullName:'Fictional Host',email:'host@example.invalid' };
  useAuthStore.setState({user:null,isAuthenticated:false});
  userService.getProfile.mockResolvedValue({ ...mocks.user, phone: '012345678' });
  authService.changePassword.mockResolvedValue({ message: 'Password changed successfully' });
  authService.resetPassword.mockResolvedValue({ message: 'Password reset successfully' });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('C08 password and recovery regressions', () => {
  it('C08-001 does not log out a new account when an older password change completes', async () => {
    let finish;
    authService.changePassword.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
    const view=open(<ChangePassword />); fillPassword();
    fireEvent.click(screen.getByRole('button',{name:'Change password'}));
    await waitFor(()=>expect(authService.changePassword).toHaveBeenCalled());
    mocks.user={...mocks.user,id:88};
    view.rerender(<MemoryRouter><ChangePassword /><Location /></MemoryRouter>);
    await act(async()=>finish({message:'Password changed successfully'}));
    expect(mocks.logout).not.toHaveBeenCalled();
  });
  it('C08-003 does not invalidate a new identity after an older reset request completes', async () => {
    let finish;
    authService.resetPassword.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
    useAuthStore.setState({user:{id:77},isAuthenticated:true});
    const invalidate=vi.spyOn(useAuthStore.getState(),'invalidateSession');
    open(<ResetPassword />,'/reset-password?token=fictional-reset');
    change(/^New password/i,'newsecret123');change(/Confirm new password/i,'newsecret123');
    fireEvent.click(screen.getByRole('button',{name:'Update password'}));
    await waitFor(()=>expect(authService.resetPassword).toHaveBeenCalled());
    useAuthStore.setState({user:{id:88},isAuthenticated:true});
    await act(async()=>finish({message:'Password reset successfully'}));
    expect(invalidate).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user.id).toBe(88);
  });
  it('C08-001 clears the revoked session immediately after dedicated password change', async () => {
    open(<ChangePassword />); fillPassword();
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(mocks.logout).toHaveBeenCalledTimes(1));
  });
  it.each(['abcdefgh', '12345678', 'a1'.repeat(51)])('C08-002 rejects account password outside server policy: %s', async value => {
    open(<ChangePassword />); fillPassword(value);
    fireEvent.submit(screen.getByRole('button', { name: 'Change password' }).closest('form'));
    expect(authService.changePassword).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });
  it('C08-002 preserves Khmer letters/digits and does not add uppercase to account policy', async () => {
    open(<ChangePassword />); fillPassword('កខគឃងចឆ១');
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(authService.changePassword).toHaveBeenCalledWith('oldsecret123', 'កខគឃងចឆ១'));
  });
  it('C08-003 consumes the query token without rendering it or retaining it in navigation', async () => {
    const { container } = open(<ResetPassword />, '/reset-password?token=fictional-reset&next=%2Fapp%2Fprofile');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/reset-password?next='));
    expect(screen.getByTestId('location').textContent).not.toContain('token=');
    expect(container.innerHTML).not.toContain('fictional-reset');
    change(/^New password/i, 'newsecret123'); change(/Confirm new password/i, 'newsecret123');
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    await waitFor(() => expect(authService.resetPassword).toHaveBeenCalledWith('fictional-reset', 'newsecret123'));
  });
  it('C08-002 requires confirmation even for a programmatic reset submission', () => {
    open(<ResetPassword />); change(/Reset token/i, 'fictional-reset'); change(/^New password/i, 'newsecret123');
    fireEvent.submit(screen.getByRole('button', { name: 'Update password' }).closest('form'));
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });
  it('C08-004 does not echo an existence-revealing recovery response', async () => {
    authService.forgotPassword.mockResolvedValue({ message: 'Account exists: private@example.invalid' });
    open(<ForgotPassword />); change(/Email address/i, 'fictional@example.invalid');
    fireEvent.click(screen.getByRole('button', { name: 'Send reset instructions' }));
    await screen.findByRole('heading', { name:'Request received' });
    expect(screen.queryByText(/Account exists/)).not.toBeInTheDocument();
    expect(document.querySelector('.auth-success')).toHaveTextContent('If');
  });
});
describe('C08 profile lifecycle regressions', () => {
  it('C08-005 ignores a late profile save after the active account changes', async () => {
    let finish;
    userService.updateProfile.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
    const view=open(<Profile />); await screen.findByLabelText('Full name');
    fireEvent.click(screen.getByRole('button',{name:'Save changes'}));
    await waitFor(()=>expect(userService.updateProfile).toHaveBeenCalled());
    mocks.user={...mocks.user,id:88,fullName:'Second Fictional Host'};
    userService.getProfile.mockResolvedValueOnce({...mocks.user});
    view.rerender(<MemoryRouter><Profile /><Location /></MemoryRouter>);
    await waitFor(()=>expect(screen.getByLabelText('Full name')).toHaveValue('Second Fictional Host'));
    await act(async()=>finish({id:77,role:'USER',fullName:'Old response'}));
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it('C08-006 stops at upload failure and retains the profile draft', async () => {
    userService.uploadProfileImage.mockRejectedValueOnce(new Error('Upload unavailable'));
    open(<Profile />); await screen.findByLabelText('Full name');
    change('Full name', 'Draft Host');
    fireEvent.change(screen.getByLabelText('Choose a profile photo'), { target: { files:[new File(['fictional'], 'avatar.png', {type:'image/png'})] } });
    fireEvent.click(screen.getByRole('button', {name:'Save changes'}));
    await waitFor(()=>expect(userService.uploadProfileImage).toHaveBeenCalledTimes(1));
    expect(userService.updateProfile).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Upload unavailable');
    expect(screen.getByLabelText('Full name')).toHaveValue('Draft Host');
  });
  it('C08-006 reuses a successful image upload on profile retry and honors canonical server data', async () => {
    userService.uploadProfileImage.mockResolvedValueOnce({url:'/uploads/fictional.png'});
    userService.updateProfile.mockRejectedValueOnce(new Error('Profile unavailable')).mockResolvedValueOnce({...mocks.user,fullName:'Canonical Host',phone:'012345678',profileImage:'/uploads/fictional.png'});
    open(<Profile />); await screen.findByLabelText('Full name');
    fireEvent.change(screen.getByLabelText('Choose a profile photo'), { target: { files:[new File(['fictional'], 'avatar.png', {type:'image/png'})] } });
    fireEvent.click(screen.getByRole('button', {name:'Save changes'}));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', {name:'Save changes'}));
    await waitFor(()=>expect(mocks.updateUser).toHaveBeenCalledWith(expect.objectContaining({fullName:'Canonical Host'})));
    expect(userService.uploadProfileImage).toHaveBeenCalledTimes(1);
    expect(userService.updateProfile).toHaveBeenLastCalledWith(expect.objectContaining({profileImage:'/uploads/fictional.png'}));
  });
  it('C08-005 surfaces profile loading failure and provides retry', async () => {
    userService.getProfile.mockRejectedValueOnce(new Error('Unavailable'));
    open(<Profile />); await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    await waitFor(() => expect(screen.getByLabelText('Full name')).toHaveValue('Fictional Host'));
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeEnabled();
  });
  it.each([
    new File(['<svg/>'], 'avatar.svg', { type: 'image/svg+xml' }),
    new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }),
  ])('C08-006 rejects unsupported or oversized avatar before reading/uploading: $name', async file => {
    open(<Profile />); await screen.findByLabelText('Full name');
    fireEvent.change(screen.getByLabelText('Choose a profile photo'), { target: { files: [file] } });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));
    expect(userService.uploadProfileImage).not.toHaveBeenCalled();
  });
  it('C08-001 clears revoked profile password session without a delayed timer', async () => {
    userService.changePassword.mockResolvedValue(undefined);
    open(<Profile />); await screen.findByLabelText('Full name');
    fireEvent.click(screen.getByRole('button', { name: 'Change password' })); fillPassword();
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    await waitFor(() => expect(mocks.logout).toHaveBeenCalledTimes(1), { timeout: 500 });
  });
});
describe('C08-002 verified AccountService password boundaries', () => {
  it.each([
    ['abcdef1',false], ['abcdefg1',true], ['a1'+'x'.repeat(98),true], ['a1'+'x'.repeat(99),false],
    ['កខគឃងចឆ១',true], ['ABCDEFG1',true], [' abcdef1',true], ['        ',false],
    ['😀😀😀1',false], ['😀😀😀a1',true],
  ])('matches UTF-16 length and BMP letter/digit rules for %s', (value,valid) => expect(isAccountPasswordValid(value)).toBe(valid));
});
describe('C08-007 continuation parser', () => {
  it.each(['/app/profile?name=%ZZ', '/app/profile?next=https%3A%2F%2Fevil.invalid', '/app/profile?token=fictional'])('rejects ambiguous or sensitive continuation %s', value => {
    expect(safeAuthRedirect(value)).toBe('/app/events');
  });
  it('preserves legitimate encoded query content and fragment', () => {
    expect(safeAuthRedirect('/app/events?search=one%2Ftwo#details')).toBe('/app/events?search=one%2Ftwo#details');
  });
});
