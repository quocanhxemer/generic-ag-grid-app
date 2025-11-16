import axios from "axios";
import API from "./api";

const requests = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getItems = async (tableName, params) => {
  if (params) {
    // send post request if there are search terms or filters applied
    const response = await requests.post(`/${tableName}/filter`, params);
    return response.data;
  } else {
    const response = await requests.get(`/${tableName}`);
    return response.data;
  }
};

export const deleteItem = async (tableName, id) => {
  const response = await requests.delete(`/${tableName}/${id}`);
  return response.data;
};

export const getItemById = async (tableName, id) => {
  const response = await requests.get(`/${tableName}/${id}`);
  return response.data;
};
