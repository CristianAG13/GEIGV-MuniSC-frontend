import apiClient from "../config/api.js";

const base = "/catalog/sources";

const sourceService = {
  async list({ tipo, q, skip = 0, take = 20 } = {}) {
    const params = { tipo, q, skip, take };
    const { data } = await apiClient.get(base, { params });
    return data; // { items, total }
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

export default sourceService;
