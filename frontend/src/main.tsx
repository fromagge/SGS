import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import App from '@/App';
import Store from '@store/store';

import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <Provider store={Store}>
    <App />
    <ToastContainer />
  </Provider>,
);
