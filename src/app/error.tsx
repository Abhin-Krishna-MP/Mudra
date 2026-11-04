'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (<div role="alert" className="panel"><h1>Something went wrong</h1><p>Please try again. If it keeps happening, the catalogue may be starting up.</p><button onClick={reset}>Try again</button></div>);
}
