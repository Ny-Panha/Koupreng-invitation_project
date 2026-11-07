import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import RoyalGallery from './components/RoyalGallery';
import { royalGardenPresentation } from './model/royalGardenPresentation';
import { normalizeIntro } from '../../shared/cinematicIntro';
import { draftToInvitationPayload, publicInvitationToDraft } from '../../../wedding-builder/utils/invitationDraftAdapter';

afterEach(cleanup);
const photos = [{ id:'portrait', src:'/owner-portrait.webp', thumbnail:'/owner-thumb.webp', alt:'Owner portrait', width:600, height:900 }, { id:'landscape', src:'/owner-landscape.webp', alt:'Owner landscape', width:1200, height:800 }];

it('keeps legacy colors and accepts only supported presentation choices', () => {
  expect(royalGardenPresentation({}).theme).toBe('royal-blue');
  expect(royalGardenPresentation({ informationScene:{ colorPreset:'bad', galleryPresentation:'bad' } }).theme).toBe('royal-blue');
  expect(royalGardenPresentation({ cinematicIntro:{ style:'royal-arch' }, informationScene:{ colorPreset:'burgundy-heritage' } })).toMatchObject({theme:'burgundy-heritage',gallery:'collage'});
});
it('round-trips optional scene settings alongside owner identity and ordering', () => {
  const draft={ templateId:'royal-garden-cinematic', groomName:'Owner', brideName:'Partner', eventDate:'2028-02-29', sectionOrder:['gallery','invitation','venue'], cinematicIntro:{ style:'royal-arch', curtainEnabled:false, curtainSpeed:'gentle', montageEnabled:false, slides:photos }, informationScene:{ colorPreset:'burgundy-heritage', galleryPresentation:'collage', monogram:{mode:'custom',asset:'/owner-mark.webp'} } };
  const payload=draftToInvitationPayload(draft);
  const saved=publicInvitationToDraft({...payload,templateCode:draft.templateId});
  expect(saved.cinematicIntro).toMatchObject(draft.cinematicIntro);
  expect(saved.informationScene).toEqual(draft.informationScene);
  expect(saved.sectionOrder).toEqual(draft.sectionOrder);
  expect(normalizeIntro(saved.cinematicIntro)).toMatchObject({curtainEnabled:false,curtainSpeed:'gentle',montageEnabled:false});
});
it('uses thumbnail tiles, opens the original, and supports keyboard and close focus restoration', () => {
  const {container}=render(<RoyalGallery photos={photos} english presentation="collage" />);
  const trigger=screen.getByRole('button',{name:'Enlarge photo 1 / 2'}); trigger.focus();
  expect(container.querySelector('img')).toHaveAttribute('src','/owner-thumb.webp');
  fireEvent.click(trigger); const dialog=screen.getByRole('dialog',{name:'Photo gallery'});
  expect(dialog.querySelector('img')).toHaveAttribute('src','/owner-portrait.webp');
  fireEvent.keyDown(document.activeElement,{key:'ArrowRight'});
  expect(dialog.querySelector('img')).toHaveAttribute('src','/owner-landscape.webp');
  expect(dialog.querySelector('.rg-expanded-actions')).toHaveTextContent('2 / 2');
  fireEvent.error(dialog.querySelector('img'));
  expect(screen.getByText('This photo could not be loaded.')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Close photo'})); expect(trigger).toHaveFocus();
});
it('renders empty galleries without a focusable empty lightbox', () => {
  render(<RoyalGallery photos={[]} english presentation="collage" />);
  expect(screen.getByText('Your wedding memories will appear here.')).toBeVisible();
  expect(screen.queryByRole('button')).toBeNull(); expect(screen.queryByRole('dialog')).toBeNull();
});
