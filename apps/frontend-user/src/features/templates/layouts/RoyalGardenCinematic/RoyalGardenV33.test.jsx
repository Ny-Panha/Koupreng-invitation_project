import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import RoyalGardenWeddingCalendar from './components/RoyalGardenWeddingCalendar';
import { royalGardenDemoContent } from '../../shared/royalGardenDemo';
import { buildTemplateContent } from '../../experience/config/templateExperienceContent';
import { visibleProgramDays } from '../../shared/program';

afterEach(cleanup);
describe('Royal Garden V3.3 demo and guest calendar',()=>{
  it('shows the demo month and two ceremony days without the removed sample card or calendar controls',()=>{
    const demo=royalGardenDemoContent();
    const {container}=render(<RoyalGardenWeddingCalendar content={demo} days={visibleProgramDays(demo)} english/>);
    expect(container.querySelectorAll('[data-ceremony=true]')).toHaveLength(2);
    expect(container.querySelector('.rg-selected-day')).toBeNull();expect(container.querySelector('.rg-calendar-export')).toBeNull();expect(container.querySelector('.rg-calendar-legend')).toBeNull();
    expect(screen.queryByRole('button',{name:/Add to Calendar/})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Next month'}));expect(screen.getByRole('table')).toHaveAccessibleName(/July/);
  });
  it('keeps saved invitation details and enabled Add to Calendar controls available to real guests',()=>{
    const guest={...royalGardenDemoContent(),isTemplateDemo:false};
    const {container,rerender}=render(<RoyalGardenWeddingCalendar content={guest} days={visibleProgramDays(guest)} english/>);
    expect(container.querySelector('.rg-selected-day')).not.toBeNull();expect(screen.getByRole('button',{name:/Add to Calendar/})).toBeEnabled();
    rerender(<RoyalGardenWeddingCalendar content={{...guest,saveTheDate:{...guest.saveTheDate,showAddToCalendar:false}}} days={visibleProgramDays(guest)} english/>);
    expect(screen.queryByRole('button',{name:/Add to Calendar/})).not.toBeInTheDocument();
  });
  it('never injects demo geography, dates or names into host-authored content',()=>{
    const host={title:'Owner wedding',eventDate:'2028-02-29',eventTime:'09:30',groomName:'Owner',brideName:'Partner',programDays:[],schedule:[],illustratedMap:{version:1,enabled:false,nodes:[]}};
    const result=buildTemplateContent({code:'royal-garden-cinematic',hostContent:host});
    expect(result.isTemplateDemo).toBeUndefined();expect(result.illustratedMap).toEqual(host.illustratedMap);expect(JSON.stringify(result)).not.toContain('royal-demo-map');
  });
  it('keeps the catalogue date and sample program synchronized across a year boundary',()=>{
    const sample=royalGardenDemoContent({eventDate:'2028-01-01',eventTime:'18:30',eventTimezone:'Asia/Phnom_Penh'});
    expect(sample.eventDate).toBe('2028-01-01');expect(sample.eventTime).toBe('18:30');expect(sample.programDays.map(day=>day.date)).toEqual(['2027-12-31','2028-01-01']);
    expect(sample.schedule.at(-1)).toMatchObject({date:'2028-01-01',time:'18:30'});
  });
});
