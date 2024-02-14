// In src/components/SvgBackgroundContainer.js

import React from 'react';

const SvgBackgroundContainer = ({ children }) => {
  const containerStyle = {
    backgroundImage: 'url("https://svgshare.com/i/12yj.svg")', // Your SVG URL
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    width: '100%',
    height: '100vh', // Adjust based on your need
  };

  return <div style={containerStyle}>{children}</div>;
};

export default SvgBackgroundContainer;
