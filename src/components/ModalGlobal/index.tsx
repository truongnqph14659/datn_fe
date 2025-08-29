import {useWindowDimensions} from '@/shared/hooks';
import {Button, Modal} from 'antd';
import {JSX, ReactNode} from 'react';
import './index.scss';

interface ModalCustomProps {
  isModalVisible: boolean;
  handleOk?: () => void;
  handleCancel?: () => void;
  okText?: string;
  cancelText?: string;
  title?: string | null;
  content: JSX.Element;
  footer?: ReactNode;
  destroyOnClose?: boolean;
  width?: string;
  className?: string;
  wrapClassName?: string;
  subtractHeight?: number;
  isLoading?: boolean;
  maskClosable?: boolean;
}

export default function ModalGlobal({
  isModalVisible,
  handleOk,
  handleCancel,
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  title,
  content,
  footer,
  width,
  destroyOnClose,
  className,
  wrapClassName,
  subtractHeight,
  isLoading,
  maskClosable = false,
}: ModalCustomProps): JSX.Element {
  const {height} = useWindowDimensions();
  const modalBodyHeight = subtractHeight ? height - subtractHeight : undefined;
  return (
    <Modal
      width={width}
      styles={{
        body: {
          height: modalBodyHeight,
          overflowY: 'auto',
        },
      }}
      destroyOnClose={destroyOnClose}
      centered
      title={title}
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={okText}
      cancelText={cancelText}
      className={`modal-ant ${className}`}
      wrapClassName={wrapClassName}
      footer={
        footer === null || footer
          ? footer
          : [
              <Button key="1" className="mr-3 btn-red" onClick={handleCancel}>
                Hủy
              </Button>,
              <Button key="2" className="btn-primary" onClick={handleOk} loading={isLoading}>
                Xác Nhận
              </Button>,
            ]
      }
      maskClosable={maskClosable}
    >
      {content}
    </Modal>
  );
}
