import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import './appearance.css';
import './chapter-logo.css';
import './polish.css';
import {AppearanceProvider} from './Appearance.jsx';
createRoot(document.getElementById('root')).render(<AppearanceProvider><App/></AppearanceProvider>);
