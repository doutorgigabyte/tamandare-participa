/**
 * lib/gateway/client.ts
 *
 * Cliente do API Gateway Dr GB (proxy unificado pra Gemini, Google Maps,
 * AssemblyAI etc.). Padrão fast-path + fallback transparente:
 *
 *   1. Se DRGB_GATEWAY_ENABLED=true e env vars válidas → tenta Gateway
 *   2. Se Gateway retorna { success:false } ou erro de rede → cai pro SDK direto
 *   3. O caller não precisa saber qual caminho foi tomado
 *
 * O que NÃO passa pelo Gateway (catálogo não cobre):
 *   - Embeddings (text-embedding-004)        → use `lib/gemini/client.ts` direto
 *   - Elevation, Street View, Static Maps    → use chamadas diretas (ver /api/elevation)
 *   - Cloud Vision (label detection)         → SDK direto
 *   - reCAPTCHA Enterprise                   → SDK direto
 *   - Earth Engine                            → SDK direto
 *   - Maps JavaScript API (frontend tiles)   → impossível proxy
 *
 * Referência: PRD v1.0 §7.3 + adendo v1.1 §1 + Gateway docs §4.3/§6.1.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GATEWAY_URL = process.env.DRGB_GATEWAY_URL;
const GATEWAY_TOKEN = process.env.DRGB_GATEWAY_TOKEN;
const GATEWAY_ENABLED = process.env.DRGB_GATEWAY_ENABLED === 'true';
const GATEWAY_TIMEOUT_MS = Number(process.env.DRGB_GATEWAY_TIMEOUT_MS ?? 60000);
const GATEWAY_RETRIES = Number(process.env.DRGB_GATEWAY_RETRIES ?? 2);

export function isGatewayConfigured(): boolean {
  return GATEWAY_ENABLED && Boolean(GATEWAY_URL) && Boolean(GATEWAY_TOKEN);
}

// ---------------------------------------------------------------------------
// HTTP base
// ---------------------------------------------------------------------------

type GatewayResponse<T> = {
  success: boolean;
  data?: T;
  provider?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
  error?: string;
  statusCode?: number;
};

async function callGateway<T>(
  category: string,
  action: string,
  body: unknown,
): Promise<GatewayResponse<T>> {
  if (!isGatewayConfigured()) {
    throw new Error('Gateway not configured');
  }
  let lastErr: unknown;
  for (let attempt = 0; attempt <= GATEWAY_RETRIES; attempt++) {
    if (attempt > 0) {
      // backoff exponencial 1s, 2s
      await new Promise((r) => setTimeout(r, 2 ** (attempt - 1) * 1000));
    }
    try {
      const res = await fetch(
        `${GATEWAY_URL}/api/v1/gateway/${category}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GATEWAY_TOKEN}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
        },
      );
      const json = (await res.json()) as GatewayResponse<T>;
      // Retorna mesmo se success=false — caller decide se cai pra fallback
      return json;
    } catch (err) {
      lastErr = err;
      // só retry em erro de rede; 5xx do gateway é retornado como json{success:false}
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('gateway request failed');
}

function gatewayLog(category: string, action: string, status: 'ok' | 'fallback' | 'fail', detail?: string) {
  const prefix = status === 'ok' ? '[gateway-ok]' : status === 'fallback' ? '[gateway-fallback]' : '[gateway-fail]';
  // eslint-disable-next-line no-console
  console.log(`${prefix} ${category}.${action}${detail ? ' — ' + detail : ''}`);
}

// ---------------------------------------------------------------------------
// LLM
// ---------------------------------------------------------------------------

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatParams = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
  json?: boolean;
};

export type ChatResult = {
  content: string;
  viaGateway: boolean;
  provider?: string;
  metadata?: Record<string, unknown>;
};

async function chatViaSDK(params: ChatParams): Promise<ChatResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gateway off e GEMINI_API_KEY ausente — chat impossível.');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: params.model ?? 'gemini-2.5-flash',
    systemInstruction: params.systemPrompt,
    generationConfig: {
      temperature: params.temperature,
      maxOutputTokens: params.maxTokens,
      topP: params.topP,
      responseMimeType: params.json ? 'application/json' : undefined,
    },
  });

  const userMessages = params.messages.filter((m) => m.role !== 'system');
  const last = userMessages[userMessages.length - 1];
  const history = userMessages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(last.content);
  return {
    content: result.response.text(),
    viaGateway: false,
    provider: 'gemini',
  };
}

export async function llmChat(params: ChatParams): Promise<ChatResult> {
  if (isGatewayConfigured()) {
    try {
      const r = await callGateway<{ content: string }>('llm', 'chat', params);
      if (r.success && r.data?.content) {
        gatewayLog('llm', 'chat', 'ok', `${r.latencyMs}ms via ${r.provider}`);
        return {
          content: r.data.content,
          viaGateway: true,
          provider: r.provider,
          metadata: r.metadata,
        };
      }
      gatewayLog('llm', 'chat', 'fallback', r.error ?? 'success=false');
    } catch (err) {
      gatewayLog('llm', 'chat', 'fallback', (err as Error).message);
    }
  }
  return chatViaSDK(params);
}

export type GenerateParams = {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export async function llmGenerate(params: GenerateParams): Promise<ChatResult> {
  if (isGatewayConfigured()) {
    try {
      const r = await callGateway<{ content: string }>('llm', 'generate', params);
      if (r.success && r.data?.content) {
        gatewayLog('llm', 'generate', 'ok', `${r.latencyMs}ms via ${r.provider}`);
        return {
          content: r.data.content,
          viaGateway: true,
          provider: r.provider,
          metadata: r.metadata,
        };
      }
      gatewayLog('llm', 'generate', 'fallback', r.error ?? 'success=false');
    } catch (err) {
      gatewayLog('llm', 'generate', 'fallback', (err as Error).message);
    }
  }
  // Fallback: SDK direto (generate é só um chat sem histórico)
  return chatViaSDK({
    messages: [{ role: 'user', content: params.prompt }],
    model: params.model,
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    systemPrompt: params.systemPrompt,
  });
}

// ---------------------------------------------------------------------------
// Maps
// ---------------------------------------------------------------------------

export type GeocodeResult = {
  lat: number;
  lng: number;
  formatted_address?: string;
  place_id?: string;
};

async function geocodeViaSDK(address: string): Promise<GeocodeResult[]> {
  if (!process.env.GMAPS_BACKEND_KEY) {
    throw new Error('Gateway off e GMAPS_BACKEND_KEY ausente — geocode impossível.');
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GMAPS_BACKEND_KEY}`;
  const res = await fetch(url, { cache: 'no-store' });
  const json = (await res.json()) as {
    status: string;
    results: Array<{
      geometry: { location: { lat: number; lng: number } };
      formatted_address: string;
      place_id: string;
    }>;
    error_message?: string;
  };
  if (json.status !== 'OK') {
    throw new Error(`geocode SDK: ${json.status} ${json.error_message ?? ''}`);
  }
  return json.results.map((r) => ({
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    formatted_address: r.formatted_address,
    place_id: r.place_id,
  }));
}

export async function mapsGeocode(address: string): Promise<GeocodeResult[]> {
  if (isGatewayConfigured()) {
    try {
      const r = await callGateway<{ results: GeocodeResult[] }>('maps', 'geocode', { address });
      if (r.success && r.data?.results) {
        gatewayLog('maps', 'geocode', 'ok', `${r.latencyMs}ms`);
        return r.data.results;
      }
      gatewayLog('maps', 'geocode', 'fallback', r.error ?? 'success=false');
    } catch (err) {
      gatewayLog('maps', 'geocode', 'fallback', (err as Error).message);
    }
  }
  return geocodeViaSDK(address);
}

async function reverseGeocodeViaSDK(lat: number, lng: number): Promise<GeocodeResult[]> {
  if (!process.env.GMAPS_BACKEND_KEY) {
    throw new Error('Gateway off e GMAPS_BACKEND_KEY ausente — reverse-geocode impossível.');
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GMAPS_BACKEND_KEY}`;
  const res = await fetch(url, { cache: 'no-store' });
  const json = (await res.json()) as {
    status: string;
    results: Array<{
      geometry: { location: { lat: number; lng: number } };
      formatted_address: string;
      place_id: string;
    }>;
    error_message?: string;
  };
  if (json.status !== 'OK') {
    throw new Error(`reverse-geocode SDK: ${json.status} ${json.error_message ?? ''}`);
  }
  return json.results.map((r) => ({
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    formatted_address: r.formatted_address,
    place_id: r.place_id,
  }));
}

export async function mapsReverseGeocode(lat: number, lng: number): Promise<GeocodeResult[]> {
  if (isGatewayConfigured()) {
    try {
      const r = await callGateway<{ results: GeocodeResult[] }>('maps', 'reverse-geocode', { lat, lng });
      if (r.success && r.data?.results) {
        gatewayLog('maps', 'reverse-geocode', 'ok', `${r.latencyMs}ms`);
        return r.data.results;
      }
      gatewayLog('maps', 'reverse-geocode', 'fallback', r.error ?? 'success=false');
    } catch (err) {
      gatewayLog('maps', 'reverse-geocode', 'fallback', (err as Error).message);
    }
  }
  return reverseGeocodeViaSDK(lat, lng);
}

// ---------------------------------------------------------------------------
// Voice (sem fallback — AssemblyAI só via Gateway)
// ---------------------------------------------------------------------------

export type TranscribeParams = {
  audio_url: string;
  language?: string; // 'pt' default
};

export type TranscribeResult = {
  text: string;
  viaGateway: true;
  provider?: string;
};

export async function voiceTranscribe(params: TranscribeParams): Promise<TranscribeResult> {
  if (!isGatewayConfigured()) {
    throw new Error(
      'voice.transcribe requer Gateway ativo (DRGB_GATEWAY_ENABLED=true). Não há SDK fallback.',
    );
  }
  const r = await callGateway<{ text: string }>('voice', 'transcribe', {
    audio_url: params.audio_url,
    language: params.language ?? 'pt',
  });
  if (!r.success || !r.data?.text) {
    throw new Error(`voice.transcribe falhou: ${r.error ?? 'sem texto'}`);
  }
  gatewayLog('voice', 'transcribe', 'ok', `${r.latencyMs}ms`);
  return { text: r.data.text, viaGateway: true, provider: r.provider };
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export const gateway = {
  isConfigured: isGatewayConfigured,
  llm: { chat: llmChat, generate: llmGenerate },
  maps: { geocode: mapsGeocode, reverseGeocode: mapsReverseGeocode },
  voice: { transcribe: voiceTranscribe },
};
