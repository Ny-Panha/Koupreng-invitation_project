import { useLocation } from 'react-router-dom';
import { PageSkeleton, LoadingRegion } from './LoadingState';

export default function RouteLoadingSkeleton() {
  const { pathname } = useLocation();
  // Static marketing and auth pages have no data-shaped fallback to impersonate.
  if (!/^\/(app|dashboard|w|i|preview|event|create|payments|templates\/browse)(\/|$)/.test(pathname)) return <LoadingRegion />;
  const layout = /^\/(w|i|preview)\//.test(pathname) ? 'public'
    : /\/(invitation|edit)$/.test(pathname) ? 'studio'
    : /packages/.test(pathname) ? 'pricing'
    : /templates/.test(pathname) ? 'template'
    : /\/events$/.test(pathname) ? 'event'
    : /\/(guests|rsvp|payments|gifts|budget|delivery|check-in)$/.test(pathname) ? 'table'
    : /\/(analytics|reports)$/.test(pathname) ? 'dashboard'
    : /media/.test(pathname) ? 'gallery' : 'form';
  return <PageSkeleton layout={layout} />;
}
