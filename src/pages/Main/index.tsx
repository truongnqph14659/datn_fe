import {Content} from 'antd/es/layout/layout';
import {Suspense} from 'react';
import {Outlet} from 'react-router-dom';

const Main = () => {
  return (
    <Content className="root-children">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="p-4">
          <Outlet />
        </div>
      </Suspense>
    </Content>
  );
};

export default Main;
