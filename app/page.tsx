"use client"

import React from 'react';
import { withStreamlitConnection, ComponentProps } from "streamlit-component-lib";
import Dashboard from './pages/dashboard';

const HomePage = ({ args }: ComponentProps) => {
  return <Dashboard />;
}

export default withStreamlitConnection(HomePage);
