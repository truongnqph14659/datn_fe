import axiosCustom from '@/shared/configs/axios.config';
import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {toast} from 'react-toastify';

const useCreateContract = (): UseMutationResult<any, Error, any> => {
  return useMutation({
    mutationFn: async (data: any) => {
      const fetchdata = await axiosCustom.post('/contracts/upload-file', data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
        );
      return fetchdata.data;
    },
    onSuccess: () => {
      toast.success('successfully saved');
    },
  });
};

export {useCreateContract};
