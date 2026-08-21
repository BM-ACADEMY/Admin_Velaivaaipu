import { useEffect } from 'react';

const SITE_URL = 'https://velaivaaipu.in';

const setMeta = (name, content, attribute = 'name') => {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const SEOHead = ({ title, description, path, robots = 'index, follow', schema }) => {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path || window.location.pathname}`;
    document.title = title.length > 60 ? `${title.slice(0, 57).trim()}…` : title;
    setMeta('description', description.length > 155 ? `${description.slice(0, 152).replace(/\s+\S*$/, '')}…` : description);
    setMeta('robots', robots);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:card', 'summary_large_image');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.head.querySelectorAll('script[data-velaivaaipu-schema]').forEach((node) => node.remove());
    (Array.isArray(schema) ? schema : schema ? [schema] : []).forEach((entry) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.velaivaaipuSchema = 'true';
      script.text = JSON.stringify(entry);
      document.head.appendChild(script);
    });
  }, [title, description, path, robots, schema]);

  return null;
};

export default SEOHead;
