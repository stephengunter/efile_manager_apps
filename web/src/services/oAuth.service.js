import BaseService from '@/common/baseService';
import { API_URL } from '@/config';

const source =`${API_URL}/oauth`;

const googleLogin = (token) => BaseService.post(`${source}/google`, { token });

export default { googleLogin };