'use client';

import dynamic from 'next/dynamic';
import '../styles/index.css';
import Loading from './loading';

const App = dynamic(() => import('../App'), { ssr: false, loading: Loading  });

export default function Page() {
  return <App />;
}
