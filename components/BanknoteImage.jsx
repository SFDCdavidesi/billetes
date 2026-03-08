'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function BanknoteImage({ src, alt = '', fill, width, height, sizes, className = '', iconSize = 'w-12 h-12', priority = false }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      </div>
    );
  }

  const imgProps = { src, alt, className, onError: () => setError(true), priority };

  if (fill) {
    return <Image {...imgProps} fill sizes={sizes} />;
  }

  return <Image {...imgProps} width={width} height={height} />;
}
