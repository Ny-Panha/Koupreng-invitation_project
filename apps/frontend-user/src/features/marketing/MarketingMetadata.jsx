import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguageStore } from '../../stores/useLanguageStore';

// Marketing owns these tags only while its shell is mounted. Invitation pages
// keep their own event-specific metadata and server-rendered social previews.
export default function MarketingMetadata() {
  const { pathname } = useLocation();
  const lang = useLanguageStore(state => state.lang);
  useEffect(() => {
    const en = lang === 'en';
    const venue = pathname.startsWith('/venues');
    const contact = pathname === '/contact';
    const title = contact ? (en ? 'Contact | Koupreng' : 'ទំនាក់ទំនង | គូព្រេង')
      : venue ? (en ? 'Wedding Venues | Koupreng' : 'ទីតាំងរៀបមង្គលការ | គូព្រេង')
        : pathname === '/pricing' ? (en ? 'Pricing & Packages | Koupreng' : 'តម្លៃ និងកញ្ចប់សេវាកម្ម | គូព្រេង')
          : pathname === '/templates' ? (en ? 'Templates Catalog | Koupreng' : 'កាតាឡុកគំរូសំបុត្រអញ្ជើញ | គូព្រេង')
            : (en ? 'Koupreng - Digital Invitation' : 'គូព្រេង - សំបុត្រអញ្ជើញឌីជីថល');
    const description = contact
      ? en ? 'Questions about a design, a package or your invitation? Contact the Koupreng team.' : 'សួរអំពីគំរូ កញ្ចប់ ឬរបៀបរៀបចំសន្លឹកការរបស់អ្នក។'
      : venue
        ? en ? 'Explore an editorial venue directory. Confirm details and availability directly with each venue.' : 'បញ្ជីទីតាំងសម្រាប់ជាឯកសារយោង។ សូមបញ្ជាក់ព័ត៌មានដោយផ្ទាល់ជាមួយទីតាំង។'
        : en ? 'Choose a design, add your celebration details, and share one invitation with Koupreng.' : 'ជ្រើសរើសគំរូដែលពេញចិត្ត បញ្ចូលព័ត៌មានមង្គលការ ហើយចែករំលែកតំណភ្ជាប់ទៅភ្ញៀវបានងាយៗ។';
    const restore = [];
    const set = (selector, tag, attributes, attribute, value) => {
      let element = document.head.querySelector(selector);
      const created = !element;
      if (created) { element = document.createElement(tag); for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value); document.head.appendChild(element); }
      const previous = element.getAttribute(attribute);
      element.setAttribute(attribute, value);
      restore.push(() => { if (created) element.remove(); else if (previous === null) element.removeAttribute(attribute); else element.setAttribute(attribute, previous); });
    };
    set('meta[name="description"]', 'meta', { name: 'description' }, 'content', description);
    for (const [key,value] of [['og:title',title],['og:description',description],['twitter:title',title],['twitter:description',description]]) {
      const attribute = key.startsWith('og:') ? 'property' : 'name';
      set(`meta[${attribute}="${key}"]`, 'meta', { [attribute]: key }, 'content', value);
    }
    // Query strings and fragments do not create duplicate marketing canonicals.
    set('link[rel="canonical"]', 'link', { rel: 'canonical' }, 'href', new URL(pathname, window.location.origin).href);
    return () => restore.reverse().forEach(revert => revert());
  }, [pathname, lang]);
  return null;
}
