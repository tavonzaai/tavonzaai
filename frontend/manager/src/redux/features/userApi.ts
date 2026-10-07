import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch, getApiBaseUrl, getAuthToken } from '../api/baseApi';

export interface UpdateMePayload {
  name?: string;
  contactNo?: string;
  avatar?: string | File;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  contactNo?: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const rawUserApi = {
  /**
   * Update current user profile
   * Sends multipart/form-data to PATCH /users/me if avatar File is provided,
   * otherwise sends application/json to PATCH /users/me.
   */
  updateMe: async (payload: UpdateMePayload): Promise<UserResponse> => {
    const API_BASE_URL = getApiBaseUrl();
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (payload.avatar instanceof File) {
      const formData = new FormData();
      if (payload.name !== undefined) formData.append('name', payload.name);
      if (payload.contactNo !== undefined) formData.append('contactNo', payload.contactNo);
      formData.append('avatar', payload.avatar);

      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers, // Leave out Content-Type so browser sets boundary
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update profile.');
      }
      return json.data || json;
    } else {
      const body: Record<string, any> = {};
      if (payload.name !== undefined) body.name = payload.name;
      if (payload.contactNo !== undefined) body.contactNo = payload.contactNo;
      if (payload.avatar) body.avatar = payload.avatar;

      const response = await baseApiFetch<UserResponse>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      return response.data || (response as any);
    }
  },
};

export const updateMe = createAsyncThunk(
  'user/updateMe',
  async (payload: UpdateMePayload, { rejectWithValue }) => {
    try {
      return await rawUserApi.updateMe(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile.');
    }
  }
);
