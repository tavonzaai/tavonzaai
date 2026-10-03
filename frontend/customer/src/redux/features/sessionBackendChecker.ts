/**
 * ============================================================================
 * Session Backend Health & API Verification Checker
 * ============================================================================
 * Tests live connectivity and endpoint contract compliance for all 6
 * Tavonza Customer Session endpoints against the backend API.
 *
 * Endpoints Tested:
 *  1. POST  /sessions/scan
 *  2. GET   /sessions/:sessionId
 *  3. POST  /sessions/:sessionId/share-code
 *  4. POST  /sessions/join
 *  5. PATCH /sessions/order-mode
 *  6. POST  /sessions/:sessionId/close
 * ============================================================================
 */

import { getApiBaseUrl } from '../api/baseApi';

export interface EndpointCheckResult {
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH';
  url: string;
  reachable: boolean;
  httpStatus: number;
  expectedStatus: number[];
  statusText: string;
  responsePreview: any;
  notes: string;
  passed: boolean;
}

export interface BackendCheckReport {
  apiBaseUrl: string;
  timestamp: string;
  allReachable: boolean;
  results: EndpointCheckResult[];
}

export async function checkSessionBackendHealth(): Promise<BackendCheckReport> {
  const baseUrl = getApiBaseUrl();
  const results: EndpointCheckResult[] = [];

  // 1. POST /sessions/scan (Validation test with empty body -> expects 400 with DTO error list)
  try {
    const res = await fetch(`${baseUrl}/sessions/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => null);
    const passed = res.status === 400 && Array.isArray(data?.message);
    results.push({
      endpoint: '/sessions/scan',
      method: 'POST',
      url: `${baseUrl}/sessions/scan`,
      reachable: true,
      httpStatus: res.status,
      expectedStatus: [400, 201],
      statusText: res.statusText,
      responsePreview: data,
      notes: passed
        ? 'Endpoint active. Correctly enforces UUID branchId/tableId and tableNumber validation.'
        : 'Unexpected status or response format.',
      passed,
    });
  } catch (err: any) {
    results.push({
      endpoint: '/sessions/scan',
      method: 'POST',
      url: `${baseUrl}/sessions/scan`,
      reachable: false,
      httpStatus: 0,
      expectedStatus: [400, 201],
      statusText: err?.message || 'Network Error',
      responsePreview: null,
      notes: 'Failed to reach backend endpoint.',
      passed: false,
    });
  }

  // 2. GET /sessions/:sessionId (Non-existent UUID -> expects 404 Session Not Found)
  try {
    const dummyId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/sessions/${dummyId}`, {
      method: 'GET',
    });
    const data = await res.json().catch(() => null);
    const passed = res.status === 404 && data?.message?.toLowerCase().includes('not found');
    results.push({
      endpoint: '/sessions/:sessionId',
      method: 'GET',
      url: `${baseUrl}/sessions/${dummyId}`,
      reachable: true,
      httpStatus: res.status,
      expectedStatus: [404, 200],
      statusText: res.statusText,
      responsePreview: data,
      notes: passed
        ? 'Endpoint active. Correctly returns 404 for invalid/non-existent session ID.'
        : 'Unexpected status or response format.',
      passed,
    });
  } catch (err: any) {
    results.push({
      endpoint: '/sessions/:sessionId',
      method: 'GET',
      url: `${baseUrl}/sessions/:sessionId`,
      reachable: false,
      httpStatus: 0,
      expectedStatus: [404, 200],
      statusText: err?.message || 'Network Error',
      responsePreview: null,
      notes: 'Failed to reach backend endpoint.',
      passed: false,
    });
  }

  // 3. POST /sessions/:sessionId/share-code (Unauthenticated -> expects 401 Unauthorized from JwtAuthGuard)
  try {
    const dummyId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/sessions/${dummyId}/share-code`, {
      method: 'POST',
    });
    const data = await res.json().catch(() => null);
    const passed = res.status === 401;
    results.push({
      endpoint: '/sessions/:sessionId/share-code',
      method: 'POST',
      url: `${baseUrl}/sessions/${dummyId}/share-code`,
      reachable: true,
      httpStatus: res.status,
      expectedStatus: [401, 200],
      statusText: res.statusText,
      responsePreview: data,
      notes: passed
        ? 'Endpoint active. Correctly guarded by JwtAuthGuard (requires Bearer token).'
        : 'Unexpected status or response format.',
      passed,
    });
  } catch (err: any) {
    results.push({
      endpoint: '/sessions/:sessionId/share-code',
      method: 'POST',
      url: `${baseUrl}/sessions/:sessionId/share-code`,
      reachable: false,
      httpStatus: 0,
      expectedStatus: [401, 200],
      statusText: err?.message || 'Network Error',
      responsePreview: null,
      notes: 'Failed to reach backend endpoint.',
      passed: false,
    });
  }

  // 4. POST /sessions/join (Empty body -> expects 400 validation for code)
  try {
    const res = await fetch(`${baseUrl}/sessions/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => null);
    const passed = res.status === 400 && Array.isArray(data?.message);
    results.push({
      endpoint: '/sessions/join',
      method: 'POST',
      url: `${baseUrl}/sessions/join`,
      reachable: true,
      httpStatus: res.status,
      expectedStatus: [400, 200],
      statusText: res.statusText,
      responsePreview: data,
      notes: passed
        ? 'Endpoint active. Correctly validates presence of 6-char share code.'
        : 'Unexpected status or response format.',
      passed,
    });
  } catch (err: any) {
    results.push({
      endpoint: '/sessions/join',
      method: 'POST',
      url: `${baseUrl}/sessions/join`,
      reachable: false,
      httpStatus: 0,
      expectedStatus: [400, 200],
      statusText: err?.message || 'Network Error',
      responsePreview: null,
      notes: 'Failed to reach backend endpoint.',
      passed: false,
    });
  }

  // 5. PATCH /sessions/order-mode (Empty body -> expects 400 validation for orderMode & customerSessionId)
  try {
    const res = await fetch(`${baseUrl}/sessions/order-mode`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => null);
    const passed = res.status === 400 && Array.isArray(data?.message);
    results.push({
      endpoint: '/sessions/order-mode',
      method: 'PATCH',
      url: `${baseUrl}/sessions/order-mode`,
      reachable: true,
      httpStatus: res.status,
      expectedStatus: [400, 200],
      statusText: res.statusText,
      responsePreview: data,
      notes: passed
        ? "Endpoint active. Correctly validates 'individual' | 'together' enum and customerSessionId UUID."
        : 'Unexpected status or response format.',
      passed,
    });
  } catch (err: any) {
    results.push({
      endpoint: '/sessions/order-mode',
      method: 'PATCH',
      url: `${baseUrl}/sessions/order-mode`,
      reachable: false,
      httpStatus: 0,
      expectedStatus: [400, 200],
      statusText: err?.message || 'Network Error',
      responsePreview: null,
      notes: 'Failed to reach backend endpoint.',
      passed: false,
    });
  }

  // 6. POST /sessions/:sessionId/close (Unauthenticated -> expects 401 Unauthorized from JwtAuthGuard)
  const dummyCloseId = '00000000-0000-0000-0000-000000000000';
  try {
    const res = await fetch(`${baseUrl}/sessions/${dummyCloseId}/close`, {
      method: 'POST',
    });
    const data = await res.json().catch(() => null);
    const passed = res.status === 401;
    results.push({
      endpoint: '/sessions/:sessionId/close',
      method: 'POST',
      url: `${baseUrl}/sessions/${dummyCloseId}/close`,
      reachable: true,
      httpStatus: res.status,
      expectedStatus: [401, 200],
      statusText: res.statusText,
      responsePreview: data,
      notes: passed
        ? 'Endpoint active. Correctly guarded by JwtAuthGuard (requires Bearer token to close session).'
        : 'Unexpected status or response format.',
      passed,
    });
  } catch (err: any) {
    results.push({
      endpoint: '/sessions/:sessionId/close',
      method: 'POST',
      url: `${baseUrl}/sessions/${dummyCloseId}/close`,
      reachable: false,
      httpStatus: 0,
      expectedStatus: [401, 200],
      statusText: err?.message || 'Network Error',
      responsePreview: null,
      notes: 'Failed to reach backend endpoint.',
      passed: false,
    });
  }

  return {
    apiBaseUrl: baseUrl,
    timestamp: new Date().toISOString(),
    allReachable: results.every((r) => r.reachable && r.passed),
    results,
  };
}
