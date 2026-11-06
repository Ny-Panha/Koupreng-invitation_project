async page => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    let data = [];
    if (path.includes('/public/invitations/')) {
      if (path.endsWith('/media')) data = {};
      else if (path.endsWith('/wishes')) data = [];
      else data = { id: 990, userId: 77, title: 'Dara & Sophea', groomName: 'Dara', brideName: 'Sophea',
        templateCode: 'silk-heritage', templateId: 20, status: 'PUBLISHED', visibility: 'PUBLIC',
        eventDate: '2027-02-20', eventTime: '17:30:00', languageMode: 'EN', venueName: 'Garden House',
        slug: path.split('/').pop(), contentJson: JSON.stringify({
          showBrandMark: !path.includes('hidden'),
          brandMarkUrl: path.includes('custom') ? '/branding/icons/icon-192.png' : '',
          thankYouTitle: 'Thank you', thankYouText: 'Your presence means so much to us.',
          coverImage: '/templates/silk-heritage/portrait.webp',
          groomName: 'Dara', brideName: 'Sophea', languageMode: 'EN',
          enabledSections: { rsvp: true, map: false, gallery: false, music: false },
        }) };
    }
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data }) });
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('http://127.0.0.1:4173/w/brand-review-visible');
  await page.locator('.sh-cover').waitFor();
  return { route: page.url(), fixture: 'Synthetic read-only guest DTO; no live account or API data changed.' };
}
