import Main from '@/pages/Main';
import {ConfigProvider, Layout} from 'antd';
import {ToastContainer} from 'react-toastify';
import Header from './Header';
import Sidebar from './Sidebar';

const RootLayout = () => {
  return (
    <div className="wrapper">
      <ConfigProvider theme={{token: {fontFamily: 'Manrope, sans-serif'}}}>
        <Layout>
          <Sidebar />
          <Layout className="flex-1 w-full">
            <Header />
            <Main />
          </Layout>
        </Layout>
      </ConfigProvider>
      <ToastContainer />
    </div>
  );
};

export default RootLayout;
