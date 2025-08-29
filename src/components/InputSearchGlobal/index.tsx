import {Input, Tooltip} from 'antd';
import {SearchProps} from 'antd/es/input';
import {JSX} from 'react';
import './index.scss';

export function InputSearchGlobal(props: SearchProps): JSX.Element {
  return (
    <Tooltip placement="top" title={props.placeholder}>
      <Input.Search
        key="search"
        className="search_input"
        allowClear
        {...props}
        placeholder={props.placeholder ?? 'Tìm kiếm'}
      />
    </Tooltip>
  );
}
