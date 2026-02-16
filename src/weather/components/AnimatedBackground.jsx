import React from 'react';
import './styles.css';

export default function AnimatedBackground({ fx }) {
  return (
    <div className={`agri-bgfx agri-bgfx--${fx || 'default'}`} aria-hidden="true">
      <div className="agri-bgfx__layer agri-bgfx__layer--a" />
      <div className="agri-bgfx__layer agri-bgfx__layer--b" />
      <div className="agri-bgfx__leaf-pattern" />
      <div className="agri-bgfx__cloud agri-bgfx__cloud--1" />
      <div className="agri-bgfx__cloud agri-bgfx__cloud--2" />
      <div className="agri-bgfx__rain" />
      <div className="agri-bgfx__flash" />
    </div>
  );
}
