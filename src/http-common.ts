import axios from "axios";
import { API } from "./utils/constants";

const http = axios.create({ baseURL: API });
export default http;
