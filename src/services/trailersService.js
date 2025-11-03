import apiClient from "../config/api";

const base = "/catalog/carretas";

const trailersService = {
  async list(params = {}) {
    const { data } = await apiClient.get(base, { params });
    return data; // ideal: { items, total } o arreglo directo; te doy ambas opciones
  },
  async create(payload) {
    const { data } = await apiClient.post(base, payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`${base}/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`${base}/${id}`);
    return data;
  },
};
export default trailersService;
