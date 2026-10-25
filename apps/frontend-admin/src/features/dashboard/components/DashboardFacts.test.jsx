import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import AnimatedTrendChart from './AnimatedTrendChart';
import ConversionHealthBox from './ConversionHealthBox';
import LiveTickerBanner from './LiveTickerBanner';
import CoreMetricsBox from './CoreMetricsBox';
import { formatRevenue } from '../../../shared/utils';
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
it('core metrics keep KHR and USD separate even when the mixed scalar is null', () => {
  render(<CoreMetricsBox lang="en" data={{ totalRevenue:null,revenueComparable:false,revenueByCurrency:{ USD:10,KHR:40000 } }} formatRevenue={formatRevenue} />);
  expect(screen.getByText(/USD \$10\.00.*KHR.*40,000/)).toBeInTheDocument();
  expect(screen.queryByText('$40,010.00')).not.toBeInTheDocument();
});
