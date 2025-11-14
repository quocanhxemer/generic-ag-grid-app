import axios from "axios";
import API from "./api";

const requests = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

export default requests;
