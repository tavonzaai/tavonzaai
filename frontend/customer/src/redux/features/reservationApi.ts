import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseApiFetch } from '../api/baseApi';

export interface CreateReservationPayload {
  branchId: string;
  tableId?: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedFor: string; // ISO 8601 string
  durationMins?: number;
  specialRequest?: string;
}

export interface ReservationResponse {
  id: string;
  branchId: string;
  tableId?: string | null;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedFor: string;
  durationMins: number;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';
  specialRequest?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const reservationService = {
  /**
   * POST /tables/reservations
   * Books a table reservation at the specified branch
   */
  createReservation: async (
    payload: CreateReservationPayload
  ): Promise<ReservationResponse> => {
    const res = await baseApiFetch<ReservationResponse>('/tables/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },
};

export const bookReservation = createAsyncThunk<
  ReservationResponse,
  CreateReservationPayload,
  { rejectValue: string }
>('reservation/book', async (payload, { rejectWithValue }) => {
  try {
    return await reservationService.createReservation(payload);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to book reservation');
  }
});
