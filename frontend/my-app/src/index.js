import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import admin from './Pictures/admin.png';

// Runtime shim: replace any via.placeholder.com image src with a local default
// and add a global onerror handler so broken images fall back to the local asset.
function applyImageFallbacks() {
  try {
    const replaceIfPlaceholder = (img) => {
      try {
        if (!img) return;
        if (img.src && img.src.includes('via.placeholder.com')) {
          img.src = admin;
        }
        img.onerror = () => { img.onerror = null; img.src = admin; };
      } catch (e) {
        // ignore per-image errors
      }
    };

    // Replace existing images
    document.querySelectorAll('img').forEach(replaceIfPlaceholder);

    // Watch for new images being added later (e.g. by other scripts)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length) {
          m.addedNodes.forEach(node => {
            if (node.tagName === 'IMG') replaceIfPlaceholder(node);
            if (node.querySelectorAll) node.querySelectorAll('img').forEach(replaceIfPlaceholder);
          });
        }
      }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {
    // Not critical — if this fails, nothing breaks.
    console.warn('applyImageFallbacks failed', e);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Apply image fallbacks after the DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  applyImageFallbacks();
} else {
  window.addEventListener('DOMContentLoaded', applyImageFallbacks);
}
