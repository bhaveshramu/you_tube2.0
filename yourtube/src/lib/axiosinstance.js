import axios from "axios";
/*console.log(
  "BACKEND URL:",
  process.env.NEXT_PUBLIC_BACKEND_URL
);*/
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
 
});
export default axiosInstance;
