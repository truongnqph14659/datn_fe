import {REQUEST_CODE} from '@/shared/constants';

interface BaseRequestType {
  _id: number;
  name: string;
  code: (typeof REQUEST_CODE)[keyof typeof REQUEST_CODE];
  desc: string | null;
}

interface DMVSRequest extends BaseRequestType {
  code: typeof REQUEST_CODE.DI_MUON_VE_SOM;
  fields: {
    loai_nghi: string[];
  };
}

interface NghiPhepRequest extends BaseRequestType {
  code: typeof REQUEST_CODE.NGHI_PHEP;
  fields: {
    loai_nghi: string[];
    hinh_thuc: string[];
  };
}

interface CongTacRequest extends BaseRequestType {
  code: typeof REQUEST_CODE.DI_CONG_TAC;
  fields: {
    dia_diem: boolean;
  };
}

interface DefaultRequest extends BaseRequestType {
  fields: null;
}

interface ThayDoiGioChamCongRequest extends BaseRequestType {
  code: typeof REQUEST_CODE.THAY_DOI_GIO_CHAM_CONG;
  fields: {
    start_time: string;
    end_time: string;
    reason: string;
  };
}

export type RequestType = DMVSRequest | NghiPhepRequest | CongTacRequest | DefaultRequest | ThayDoiGioChamCongRequest;
