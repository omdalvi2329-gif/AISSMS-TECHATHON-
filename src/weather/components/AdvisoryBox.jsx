import React from 'react';

export default function AdvisoryBox({ advisory }) {
  if (!advisory) return null;

  return (
    <div className={`agri-advisory agri-advisory--${advisory.level || 'success'} agri-fade-in`}>
      <div className="agri-advisory__title">Farming Advisory</div>
      <div className="agri-advisory__msg">{advisory.message}</div>
    </div>
  );
}
