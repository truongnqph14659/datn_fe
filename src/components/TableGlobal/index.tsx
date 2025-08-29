import {Table, TablePaginationConfig, TableProps} from 'antd';
import {JSX} from 'react';
import './index.scss';

interface ITableGlobalProps extends TableProps<any> {
  total?: number;
  setPagination?: () => void;
  scrollX?: number;
  className?: string;
}

const renderPagination: TablePaginationConfig = {
  defaultPageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showQuickJumper: true,
};

export default function TableGlobal(props: ITableGlobalProps): JSX.Element {
  const {scrollX, rowSelection} = props;
  return (
    <Table
      className={`ant-table-global ${props.className}`}
      scroll={{
        scrollToFirstRowOnChange: true,
        x: scrollX ?? '800px',
        y: 'max(300px, calc(100vh - 260px))',
      }}
      rowSelection={
        rowSelection
          ? {
              ...rowSelection,
              type: 'checkbox',
              columnWidth: 50,
              fixed: 'left',
            }
          : undefined
      }
      pagination={renderPagination}
      size="middle"
      bordered
      {...props}
    />
  );
}
