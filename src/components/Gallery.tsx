'use client';
import { useState } from 'react';
import { Icon } from './Icons';

export interface GalleryItem { url: string; alt: string }

/** Record gallery: main image with counter + expand, and a thumbnail strip ("+N" for the rest). Touch friendly, swipe-free (buttons only). */
export function Gallery({ items, withheld }: { items: GalleryItem[]; withheld?: boolean }) {
  const [i, setI] = useState(0);
  if (items.length === 0) {
    return <div className="gal"><div className="gal-main gal-empty"><p>{withheld ? 'The image for this record is withheld because it is marked restricted.' : 'No image has been added yet.'}</p></div></div>;
  }
  const cur = items[i];
  const MAX = 4;
  const shown = items.length > MAX + 1 ? items.slice(0, MAX) : items;
  const rest = items.length - shown.length;
  return (
    <div className="gal">
      <div className="gal-main">
        <img src={cur.url} alt={cur.alt} />
        {items.length > 1 && (
          <>
            <button type="button" className="gal-nav prev" aria-label="Previous image" onClick={() => setI((i - 1 + items.length) % items.length)}><Icon name="chevL" size={20} /></button>
            <button type="button" className="gal-nav next" aria-label="Next image" onClick={() => setI((i + 1) % items.length)}><Icon name="chevR" size={20} /></button>
          </>
        )}
        <span className="gal-count"><Icon name="image" size={15} /> {i + 1} / {items.length}</span>
        <a className="gal-expand" href={cur.url} target="_blank" rel="noopener noreferrer" aria-label="Open image full size"><Icon name="expand" size={18} /></a>
      </div>
      {items.length > 1 && (
        <ul className="gal-thumbs">
          {shown.map((t, n) => (
            <li key={t.url + n}><button type="button" aria-label={`Show image ${n + 1}`} aria-current={n === i ? 'true' : undefined} onClick={() => setI(n)}><img src={t.url} alt="" loading="lazy" /></button></li>
          ))}
          {rest > 0 && <li><button type="button" className="more" aria-label={`Show ${rest} more images`} onClick={() => setI(shown.length)}>+{rest}</button></li>}
        </ul>
      )}
    </div>
  );
}
