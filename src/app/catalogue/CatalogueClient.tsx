'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { RecordSummary } from '@/lib/contracts';
import { searchRecords } from '@/lib/search';
import { RecordTile } from '@/components/RecordTile';
import { Icon, type IconName } from '@/components/Icons';
import { typeLabel } from '@/lib/ui';

const SORTS: Record<string, string> = { recent: 'Recently Added', az: 'Title A–Z', za: 'Title Z–A', region: 'Region' };
const TYPE_ICON: Record<string, IconName> = { ritual: 'lotus', performing: 'drum', visual: 'palette', craft: 'bell', other: 'leaf' };

function WeaveIcon() {
  return (
    <svg className="icon" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 21 12 12 21 3 12Z" /><path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" /><path d="M12 3v18M3 12h18" />
    </svg>
  );
}

function TypeGlyph({ t }: { t: string }) {
  if (t === 'textile') return <WeaveIcon />;
  return <Icon name={TYPE_ICON[t] ?? 'layers'} size={24} />;
}

export function CatalogueClient({
  all,
  regions,
  types,
  initialQ = '',
  initialRegion = '',
  initialType = '',
  initialSort = 'recent',
  initialView = 'grid',
}: {
  all: RecordSummary[];
  regions: string[];
  types: string[];
  initialQ?: string;
  initialRegion?: string;
  initialType?: string;
  initialSort?: string;
  initialView?: 'grid' | 'list';
}) {
  const [q, setQ] = useState(initialQ);
  const [region, setRegion] = useState(initialRegion);
  const [type, setType] = useState(initialType);
  const [sort, setSort] = useState(initialSort && SORTS[initialSort] ? initialSort : 'recent');
  const [view, setView] = useState<'grid' | 'list'>(initialView);
  const sortRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (sortRef.current?.open && !sortRef.current.contains(e.target as Node)) {
        sortRef.current.removeAttribute('open');
      }
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  const syncUrl = useCallback((next: { q?: string; region?: string; type?: string; sort?: string; view?: string }) => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams();
    if (next.q?.trim()) p.set('q', next.q.trim());
    if (next.region) p.set('region', next.region);
    if (next.type) p.set('type', next.type);
    if (next.sort && next.sort !== 'recent') p.set('sort', next.sort);
    if (next.view && next.view !== 'grid') p.set('view', next.view);
    const s = p.toString();
    const url = `/catalogue${s ? `?${s}` : ''}`;
    window.history.replaceState(null, '', url);
  }, []);

  const handleQueryChange = (val: string) => {
    setQ(val);
    syncUrl({ q: val, region, type, sort, view });
  };

  const handleRegionChange = (val: string) => {
    setRegion(val);
    syncUrl({ q, region: val, type, sort, view });
  };

  const handleTypeSelect = (t?: string) => {
    const nextType = t ?? '';
    setType(nextType);
    syncUrl({ q, region, type: nextType, sort, view });
  };

  const handleSortSelect = (k: string) => {
    setSort(k);
    syncUrl({ q, region, type, sort: k, view });
  };

  const handleViewToggle = (v: 'grid' | 'list') => {
    setView(v);
    syncUrl({ q, region, type, sort, view: v });
  };

  const handleReset = () => {
    setQ('');
    setRegion('');
    setType('');
    setSort('recent');
    syncUrl({ q: '', region: '', type: '', sort: 'recent', view });
  };

  // Instant live search & filter
  const found = useMemo(() => {
    return searchRecords(all, q, {
      region: region || undefined,
      workType: type || undefined,
    });
  }, [all, q, region, type]);

  // Sort items
  const items = useMemo(() => {
    const list = [...found];
    if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') list.sort((a, b) => b.title.localeCompare(a.title));
    if (sort === 'region') list.sort((a, b) => a.region.localeCompare(b.region) || a.title.localeCompare(b.title));
    return list;
  }, [found, sort]);

  /** Builds fallback hrefs for search engine indexing or right-click open tab */
  const buildHref = (o: { q?: string; region?: string; type?: string; sort?: string; view?: string } = {}) => {
    const next = { q, region, type, sort, view, ...o };
    const p = new URLSearchParams();
    if (next.q?.trim()) p.set('q', next.q.trim());
    if (next.region) p.set('region', next.region);
    if (next.type) p.set('type', next.type);
    if (next.sort && next.sort !== 'recent') p.set('sort', next.sort);
    if (next.view && next.view !== 'grid') p.set('view', next.view);
    const s = p.toString();
    return `/catalogue${s ? `?${s}` : ''}`;
  };

  return (
    <>
      <form
        role="search"
        method="get"
        action="/catalogue"
        id="search"
        className="ui"
        onSubmit={(e) => {
          e.preventDefault(); // Results are already live!
        }}
      >
        <div className="searchbar">
          <Icon name="search" size={20} />
          <label htmlFor="q" className="sr">Search by title, credited party or ID</label>
          <input
            id="q"
            name="q"
            type="search"
            value={q}
            onChange={(e) => handleQueryChange(e.target.value)}
            onInput={(e) => handleQueryChange((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleQueryChange('');
              }
            }}
            placeholder="Search works, forms, communities…"
            autoComplete="off"
          />
          {q && (
            <button
              type="button"
              className="cat-clear"
              onClick={() => handleQueryChange('')}
              aria-label="Clear search text"
              title="Clear search"
            >
              <Icon name="close" size={16} />
            </button>
          )}
          {type && <input type="hidden" name="type" value={type} />}
          {sort !== 'recent' && <input type="hidden" name="sort" value={sort} />}
          {view === 'list' && <input type="hidden" name="view" value="list" />}
          <details className="filters">
            <summary aria-label="Filter by region"><Icon name="filter" size={22} /></summary>
            <div className="pop">
              <label htmlFor="region">Region</label>
              <select
                id="region"
                name="region"
                value={region}
                onChange={(e) => handleRegionChange(e.target.value)}
              >
                <option value="">All regions</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </details>
          <button type="submit" className="go">Search</button>
        </div>
      </form>

      <nav aria-label="Type of work">
        <ul className="chip-row cat-chips">
          <li>
            <a
              href={buildHref({ type: undefined })}
              aria-current={!type ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); handleTypeSelect(undefined); }}
            >
              <Icon name="grid" size={24} /><span>All</span>
            </a>
          </li>
          {types.map((t) => (
            <li key={t}>
              <a
                href={buildHref({ type: t })}
                aria-current={type === t ? 'true' : undefined}
                onClick={(e) => { e.preventDefault(); handleTypeSelect(t); }}
              >
                <TypeGlyph t={t} /><span>{typeLabel(t)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="cat-bar ui">
        <p className="count" role="status">
          {items.length} {items.length === 1 ? 'record' : 'records'}{q ? ` for “${q}”` : ''}
        </p>
        <div className="cat-tools">
          <div className="view-toggle" role="group" aria-label="Layout">
            <a
              href={buildHref({ view: undefined })}
              aria-label="Grid view"
              aria-current={view === 'grid' ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); handleViewToggle('grid'); }}
            >
              <Icon name="grid" size={18} />
            </a>
            <a
              href={buildHref({ view: 'list' })}
              aria-label="List view"
              aria-current={view === 'list' ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); handleViewToggle('list'); }}
            >
              <Icon name="menu" size={18} />
            </a>
          </div>
          <details ref={sortRef} className="sort">
            <summary aria-label="Sort records"><span>{SORTS[sort]}</span><Icon name="chevDown" size={16} /></summary>
            <ul>
              {Object.entries(SORTS).map(([k, label]) => (
                <li key={k}>
                  <a
                    href={buildHref({ sort: k === 'recent' ? undefined : k })}
                    aria-current={sort === k ? 'true' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSortSelect(k);
                      sortRef.current?.removeAttribute('open');
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="cat-empty ui" role="status">
          <div className="cat-empty-icon" aria-hidden="true">
            <Icon name="search" size={26} />
          </div>
          <h2>No matching cultural expressions found</h2>
          <p className="cat-empty-lede">
            {q ? (
              <>
                We could not find any registered expressions matching{' '}
                <strong>“{q}”</strong>
                {type ? ` under ${typeLabel(type)}` : ''}
                {region ? ` in ${region}` : ''}.
              </>
            ) : (
              <>
                There are currently no records registered for the selected filter criteria
                {type ? ` (${typeLabel(type)})` : ''}
                {region ? ` in ${region}` : ''}.
              </>
            )}
          </p>

          <div className="cat-empty-hints">
            <span className="cat-empty-hints-label">Explore popular traditions:</span>
            {['Mohiniyattam', 'Kathakali', 'Theyyam', 'Kasavu', 'Aranmula'].map((term) => (
              <button
                key={term}
                type="button"
                className="cat-suggest-pill"
                onClick={() => handleQueryChange(term)}
              >
                {term}
              </button>
            ))}
          </div>

          <div className="cat-empty-actions">
            <button
              type="button"
              className="cat-empty-btn-primary"
              onClick={handleReset}
            >
              <span>Reset Search & Filters</span>
            </button>
            <a href="/submit" className="cat-empty-btn-secondary">
              <span>Submit a Cultural Work</span>
              <Icon name="arrow" size={16} />
            </a>
          </div>
        </div>
      ) : (
        <ul className={`tile-grid cat-grid${view === 'list' ? ' is-list' : ''}`}>
          {items.map((r, i) => (
            <RecordTile key={r.id} r={r} i={i} catalogue />
          ))}
        </ul>
      )}
    </>
  );
}

