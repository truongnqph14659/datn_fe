// import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import viVN from 'antd/es/locale/vi_VN';
import {ConfigProvider} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import '@styles/index.scss';
dayjs.locale('vi');

createRoot(document.getElementById('root')!).render(
  <ConfigProvider locale={viVN}>
    <App />,
  </ConfigProvider>,
);
