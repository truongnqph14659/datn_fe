import {envConfig} from '@/shared/configs/common.config';
import {localStorageKeys} from '@/shared/constants';
import axios from 'axios';

const axiosCustom = axios.create({
  baseURL: envConfig.api_endpoint,
  headers: {'Content-Type': 'application/json'},
});

axiosCustom.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosCustom.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    // const originalRequest = error.config;

    // if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/user/login') {
    //   originalRequest._retry = true;

    //   try {
    //     const refreshToken = localStorage.getItem(localStorageKeys.REFRESH_TOKEN);
    //     const response = await axios.post(`${envConfig.api_endpoint}/user/refresh-token`, {
    //       refresh_token: refreshToken,
    //     });
    //     const {new_access_token, new_refresh_token} = response.data.data;

    //     localStorage.setItem(localStorageKeys.ACCESS_TOKEN, new_access_token);
    //     localStorage.setItem(localStorageKeys.REFRESH_TOKEN, new_refresh_token);

    //     originalRequest.headers['Authorization'] = `Bearer ${new_access_token}`;

    //     return axiosCustom(originalRequest);
    //   } catch (refreshError) {
    //     localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    //     localStorage.removeItem(localStorageKeys.REFRESH_TOKEN);

    //     window.location.href = '/login';
    //     return Promise.reject(refreshError);
    //   }
    // }
    return Promise.reject(error);
  },
);

export default axiosCustom;
