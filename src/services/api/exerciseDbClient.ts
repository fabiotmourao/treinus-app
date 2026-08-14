import axios from 'axios';

export const exerciseDbClient = axios.create({
  baseURL: 'https://oss.exercisedb.dev/api/v1',
  timeout: 20000,
});
