import React from 'react';

const PokeBall = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 100 100"
    width="32"
    height="32"
  >
    {/* Outer Circle */}
    <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="5" />
    
    {/* Top Half */}
    <path d="M 5 50 A 45 45 0 0 1 95 50" fill="red" stroke="black" strokeWidth="5" />

    {/* Black Middle Band */}
    <rect x="5" y="45" width="90" height="10" fill="black" />

    {/* Outer White Circle (Center Button) */}
    <circle cx="50" cy="50" r="12" fill="white" stroke="black" strokeWidth="5" />

    {/* Inner Black Circle (Center Button) */}
    <circle cx="50" cy="50" r="6" fill="black" />
  </svg>
);

export default PokeBall;
