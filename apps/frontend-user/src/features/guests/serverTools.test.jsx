import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GuestImportModal from './components/GuestImportModal';
import { guestService } from './api/guestApi';
import { useLanguageStore } from '@/stores/useLanguageStore';
vi.mock('./api/guestApi', () => ({ guestService: { inspectImport: vi.fn(), previewBatch: vi.fn(), commitBatch: vi.fn() } }));
const source = { worksheets: [{ name: 'Guests', headers: ['ឈ្មោះភ្ញៀវ', 'Phone', 'Guest Count'], rows: [{ rowNumber: 2, values: ['ភ្ញៀវគំរូ', '012000001', '2'], issues: [] }] }] };
beforeEach(() => {
  vi.clearAllMocks(); sessionStorage.clear(); useLanguageStore.setState({ lang: 'en' }); vi.stubGlobal('crypto', webcrypto);
  guestService.inspectImport.mockResolvedValue(source);
  guestService.previewBatch.mockImplementation(async (id, payload) => ({ ...payload, committed: false, rows: payload.rows.map(row => ({ rowNumber: row.rowNumber, status: row.skip ? 'SKIPPED' : 'READY', issues: [] })) }));
  guestService.commitBatch.mockImplementation(async (id, payload) => ({ batchId: payload.batchId, committed: true, importedCount: 1, updatedCount: 0, skippedCount: 0, failedCount: 0, rows: [{ rowNumber: 2, status: 'IMPORTED', issues: [] }] }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
async function uploadAndValidate() {
  fireEvent.change(screen.getByLabelText('Guest import file'), { target: { files: [new File(['fixture'], 'guests.xlsx')] } });
  await screen.findByText('guests.xlsx');
  fireEvent.click(screen.getByRole('button', { name: 'Validate rows' }));
  await screen.findByText(/Nothing has been imported yet/);
}
describe('server-authorized guest import', () => {
  it('provides real template links and leaves private Sheets unavailable', () => {
    render(<GuestImportModal isOpen invitationId={42} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'CSV' })).toHaveAttribute('href', '/downloads/Koupreng-Guest-Import-Template.csv');
    expect(screen.getByRole('link', { name: 'XLSX' })).toHaveAttribute('download');
    fireEvent.click(screen.getByText('Google Sheets', { selector: 'summary' }));
    expect(screen.getByRole('button', { name: /Private Sheet import/ })).toBeDisabled();
  });
  it('maps Khmer columns, preserves phone text, confirms before saving and shows actual result', async () => {
    const refresh = vi.fn(); render(<GuestImportModal isOpen invitationId={42} onFileImported={refresh} onClose={vi.fn()} />);
    await uploadAndValidate();
    expect(guestService.commitBatch).not.toHaveBeenCalled();
    const payload = guestService.previewBatch.mock.calls[0][1];
    expect(payload.rows[0].guest).toMatchObject({ guestName: 'ភ្ញៀវគំរូ', phone: '012000001', seatCount: '2' });
    fireEvent.click(screen.getByRole('button', { name: 'Review import' }));
    expect(guestService.commitBatch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm import' }));
    await screen.findByText('Import saved to this event'); expect(refresh).toHaveBeenCalledOnce();
    expect(guestService.commitBatch).toHaveBeenCalledWith(42, payload);
  });
  it('retains an uncertain request and retries with exactly the same batch and rows', async () => {
    guestService.commitBatch.mockRejectedValueOnce(new Error('Connection lost'));
    render(<GuestImportModal isOpen invitationId={42} onClose={vi.fn()} />); await uploadAndValidate();
    fireEvent.click(screen.getByRole('button', { name: 'Review import' })); fireEvent.click(screen.getByRole('button', { name: 'Confirm import' }));
    await screen.findByRole('alert'); expect(screen.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry same batch' })); await screen.findByText('Import saved to this event');
    expect(guestService.commitBatch.mock.calls[0][1]).toEqual(guestService.commitBatch.mock.calls[1][1]);
  });
  it('rejects oversized/disallowed files without a request and retains failed inspection', async () => {
    render(<GuestImportModal isOpen invitationId={42} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Guest import file'), { target: { files: [new File(['x'], 'macro.xlsm')] } });
    await screen.findByRole('alert'); expect(guestService.inspectImport).not.toHaveBeenCalled();
    guestService.inspectImport.mockRejectedValueOnce(new Error('Invalid workbook'));
    fireEvent.change(screen.getByLabelText('Guest import file'), { target: { files: [new File(['x'], 'guests.xlsx')] } });
    await screen.findByText('Invalid workbook'); expect(guestService.commitBatch).not.toHaveBeenCalled();
  });
  it('requires revalidation after a correction and blocks unresolved duplicates', async () => {
    guestService.previewBatch.mockResolvedValueOnce({ committed: false, rows: [{ rowNumber: 2, status: 'DUPLICATE', issues: ['Shared phone'] }] });
    render(<GuestImportModal isOpen invitationId={42} onClose={vi.fn()} />); await uploadAndValidate();
    expect(screen.getByRole('button', { name: 'Review import' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Correct row' }));
    fireEvent.change(screen.getByLabelText('Phone', { selector: 'input' }), { target: { value: '012000002' } });
    expect(screen.getByRole('button', { name: 'Review import' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Revalidate' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Review import' })).toBeEnabled());
  });
});
