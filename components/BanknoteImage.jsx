'use client';

import { useState } from 'react';
import Image from 'next/image';

const isExternal = (url) => typeof url === 'string' && url.startsWith('http');

export default function BanknoteImage({ src, alt = '', fill, width, height, sizes, className = '', iconSize = 'w-12 h-12', priority = false }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      </div>
    );
  }

  const external = isExternal(src);
  const imgProps = {
    src,
    alt,
    className: `${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: () => setError(true),
    onLoad: () => setLoading(false),
    priority,
    ...(external ? { unoptimized: true } : {}),
  };

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {fill ? (
        <Image {...imgProps} fill sizes={sizes} />
      ) : (
        <Image {...imgProps} width={width} height={height} />
      )}
    </>
  );
}
