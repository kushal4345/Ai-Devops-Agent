import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import '../pages/HomePage.css';

export default function PublicLayout() {
  return (
    <>
      <div className="hp-bg" />
      <Navbar />
      <Outlet />
    </>
  );
}
