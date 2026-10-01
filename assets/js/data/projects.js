/* =============================================
   PROJECT DATA
   Single source of truth for project metadata that is shared by several
   modules. The project cards themselves stay as static HTML (good for SEO
   and for visitors without JavaScript); each card declares its categories
   with data-categories="nlp ml".
   ============================================= */

/** Filter categories: id -> label shown on the filter bar. Order = button order. */
export const CATEGORIES = {
  nlp: 'NLP',
  ml: 'Machine Learning',
  analysis: 'Data Analysis',
  cv: 'Computer Vision',
  web: 'Backend & Web',
};

/**
 * Projects in display order. This drives the prev/next links on every project
 * page, so keep it in the same order as the cards in projects.html.
 * `id` matches data-current on the page's <nav data-project-nav>.
 */
export const PROJECTS = [
  { id: 'social-media-clustering', href: 'project-social-media-clustering.html', title: 'Social Media Clustering' },
  { id: 'cycle-monitoring',        href: 'project-cycle-monitoring.html',        title: 'Cycle Monitoring System' },
  { id: 'hotel-booking',           href: 'project-hotel-booking.html',           title: 'Hotel Booking Prediction' },
  { id: 'amazon-saas',             href: 'project-amazon-saas.html',             title: 'Amazon SaaS Analysis' },
  { id: 'sign-language',           href: 'project-sign-language.html',           title: 'Sign Language Interpreter' },
  { id: 'international-debt',      href: 'project-international-debt.html',      title: 'International Debt Analysis' },
];
