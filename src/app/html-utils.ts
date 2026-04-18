import DOMPurify from 'dompurify';

export function decodeHtmlEntities(str: string) {
  const txt = document.createElement('textarea');
  // Textareas do not execute script content — this is the canonical XSS-safe entity-decode idiom.
  // eslint-disable-next-line no-unsanitized/property
  txt.innerHTML = str;
  return txt.value;
}


export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'div',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ADD_ATTR: ['target'],
  });
}
