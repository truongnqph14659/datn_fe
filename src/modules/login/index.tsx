// pages/LoginPage.tsx
import {LoginData, loginSchema} from '@/modules/login/form-config';
import {localStorageKeys} from '@/shared/constants';
import {useLogin} from '@/shared/hooks/react-query-hooks/auth';
import {useAuthStore} from '@/store/authStore';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button, Form, Input} from 'antd';
import {AxiosError} from 'axios';
import {Controller, useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';

const LoginPage = () => {
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const {mutate: MutationLogin, isPending} = useLogin();

  const onSubmit = (data: LoginData) => {
    MutationLogin(data, {
      onSuccess: ({data: {access_token, user}}) => {
        login(access_token, user);
        localStorage.setItem(localStorageKeys.ACCESS_TOKEN, access_token);
        navigate('/');
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error(error?.response?.data?.message || 'Có lỗi xảy ra!!');
        } else {
          toast.error('Có lỗi xảy ra');
        }
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Form
          onFinish={handleSubmit(onSubmit)}
          layout="vertical"
          className="w-full max-w-md p-8 bg-white rounded-md shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-semibold text-center">Đăng nhập</h2>

          <Form.Item label="Email" required help={errors.email?.message} validateStatus={errors.email ? 'error' : ''}>
            <Controller
              name="email"
              control={control}
              render={({field}) => <Input {...field} placeholder="Nhập email" />}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            required
            help={errors.password?.message}
            validateStatus={errors.password ? 'error' : ''}
          >
            <Controller
              name="password"
              control={control}
              render={({field}) => <Input.Password {...field} placeholder="Nhập mật khẩu" />}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isPending} className="w-full">
            Đăng nhập
          </Button>
        </Form>
      </div>
      <ToastContainer />
    </>
  );
};

export default LoginPage;
