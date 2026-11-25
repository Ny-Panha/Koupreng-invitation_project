import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import AnimatedTrendChart from './AnimatedTrendChart';
import ConversionHealthBox from './ConversionHealthBox';
import LiveTickerBanner from './LiveTickerBanner';
import CoreMetricsBox from './CoreMetricsBox';
afterEach(cleanup);
it('never substitutes invented revenue, trends, delivery or uptime when reports are missing', () => {
  render(<MemoryRouter><AnimatedTrendChart lang="en" /><ConversionHealthBox lang="en" /><LiveTickerBanner lang="en" /></MemoryRouter>);
  expect(screen.getByText(/Receipt report unavailable/)).toBeInTheDocument();
  expect(screen.getAllByText('Unavailable')).toHaveLength(6);
  expect(screen.queryByText(/4772|4,772|94%|342|99.98%|98% delivery|16%/)).not.toBeInTheDocument();
});
it('keeps zero counts and currencies truthful and describes the current snapshot', () => {
  render(<MemoryRouter><AnimatedTrendChart lang="en" report={{ summary:{ paidRevenueByCurrency:{ USD:0,KHR:12000 } } }} /><ConversionHealthBox lang="en" analytics={{ checkIn:{ summary:{ checkedIn:0 } },health:{ summary:{ status:'WARN' } } }} /></MemoryRouter>);
  expect(screen.getByRole('cell', { name: '$0.00' })).toBeInTheDocument();
  expect(screen.getByRole('rowheader', { name: 'KHR' })).toBeInTheDocument();
  expect(screen.getByText('WARN')).toBeInTheDocument();
  expect(screen.getByText(/not individual arrival counts/)).toBeInTheDocument();
});
it('receipt totals keep KHR and USD separate even when a mixed scalar would be invalid', () => {
  render(<MemoryRouter><AnimatedTrendChart lang="en" report={{ summary: { paidRevenueByCurrency: { USD:10,KHR:40000 } } }} /></MemoryRouter>);
  expect(screen.getByRole('cell', { name: '$10.00' })).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: /40,000/ })).toBeInTheDocument();
  expect(screen.queryByText('$40,010.00')).not.toBeInTheDocument();
});
it('distinguishes unknown counts from recorded zero counts', () => {
  render(<CoreMetricsBox lang="en" data={{ totalUsers:0, activeUsers:0 }} />);
  expect(screen.getByText('0')).toBeInTheDocument();
  expect(screen.getByText('0 active accounts')).toBeInTheDocument();
  expect(screen.getAllByText('—')).toHaveLength(3);
});
