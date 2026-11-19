import { expect, it } from 'vitest';
import { compareEvents, eventDay, eventProvenance, pageItems } from './eventListModel';
it('C12-006 newest sort handles missing/malformed timestamps and stable numeric ties',()=>{
  const records=[{id:10},{id:3,updatedAt:'bad',createdAt:'2026-11-18'},{id:2},{id:4,updatedAt:1795046400000}];
  expect([...records].sort(compareEvents).map(x=>x.id)).toEqual([4,3,2,10]);
  expect([...records].reverse().sort(compareEvents).map(x=>x.id)).toEqual([4,3,2,10]);
});
it('C12-007 rejects rolled-over and missing calendar dates',()=>{expect(eventDay({eventDate:'2028-02-29'})).toBe('2028-02-29'); expect(eventDay({eventDate:'2027-02-29'})).toBeNull(); expect(eventDay({})).toBeNull();});
it('C12-008 keeps server identity and unsaved changes as separate facts',()=>{expect(eventProvenance({id:12,syncStatus:'SYNC_FAILED'})).toMatchObject({serverId:'12',resume:true}); expect(eventProvenance({id:'unknown'}).resume).toBe(true); expect(eventProvenance({id:12,shared:true,syncStatus:'SYNC_FAILED'}).resume).toBe(false);});
it.each([0,1,11,12,13,25,100])('bounds page controls for %i records',records=>{const count=Math.ceil(records/12); expect(pageItems(Math.max(0,count-1),count).filter(Number.isInteger).every(x=>x>=0&&x<count)).toBe(true);});
