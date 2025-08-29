import {LoadingOutlined} from '@ant-design/icons';
import React, {ReactNode} from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  preIcon?: ReactNode;
  sufIcon?: ReactNode;
  variant?: 'btnBlue' | 'btnRed' | 'btnGreen';
  size?: 'sm' | 'default' | 'lg' | 'full';
}

const getButtonClass = (variant?: string, size?: string, className?: string) => {
  const baseClass =
    'p-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses: Record<string, string> = {
    btnBlue: 'text-white bg-[#1c7fff]',
    btnRed: 'text-white bg-[#ee4b4b]',
    btnGreen: 'text-white bg-[#0f7c41]',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'p-1',
    default: 'h-9 px-3',
    lg: 'h-12 py-3 px-6',
    full: 'h-11 w-full',
  };

  return [
    baseClass,
    variantClasses[variant || 'btnBlue'], // Mặc định là btnBlue
    sizeClasses[size || 'default'], // Mặc định là default
    className,
  ]
    .filter(Boolean) // Loại bỏ giá trị `undefined`
    .join(' ');
};

const ButtonGlobal = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, children, variant = 'btnBlue', isLoading, preIcon, sufIcon, size = 'default', ...props}, ref) => {
    return (
      <button className={getButtonClass(variant, size, className)} ref={ref} disabled={isLoading} {...props}>
        {preIcon}
        {children}
        {sufIcon}
        {isLoading ? <LoadingOutlined className="ml-2 text-sm" spin /> : null}
      </button>
    );
  },
);

ButtonGlobal.displayName = 'ButtonGlobal';

export default ButtonGlobal;
