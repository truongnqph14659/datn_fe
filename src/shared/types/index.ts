import {CSSProperties} from 'react';

export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data: T;
}

export interface IMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPage: number;
}

export interface ApiResponseWithMeta<T> extends ApiResponse<T> {
  meta: IMetadata;
}

export interface ISvgIcon {
  width?: string;
  height?: string;
  fillColor?: string;
  className?: string;
  style?: CSSProperties;
}

export interface IQueryParamsDefault {
  page?: number;
  limit?: number;
  disablePagination?: boolean;
  search?: string;
  searchFields?: string[];
}

export interface DayInfo {
  date: string;
  day: string;
  status: string;
  work_date: string;
}
