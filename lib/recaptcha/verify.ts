/**
 * lib/recaptcha/verify.ts
 *
 * Verificação de tokens reCAPTCHA Enterprise.
 *   - Quando RECAPTCHA_SECRET_KEY ausente → fallback { score:1, valid:true }
 *     pra permitir desenvolvimento local sem captcha funcionar (PRD adendo
 *     v1.1 §1.4: anti-spam só em prod).
 *   - Quando configurado → chama Assessment API v1.
 *
 * Em prod, score < 0.3 vai pra rejeição (429). Entre 0.3 e 0.5 publica como
 * "pending" pra moderação humana (já é o default do MVP 1).
 *
 * Referência: https://cloud.google.com/recaptcha-enterprise/docs/create-assessment
 */

export type RecaptchaAssessment = {
  /** 0.0 (bot) a 1.0 (humano). 1.0 quando captcha está desligado. */
  score: number;
  /** true se o token é válido (ou se o captcha está desligado). */
  valid: boolean;
  /** reCAPTCHA Enterprise reason codes (LOW_CONFIDENCE_SCORE, AUTOMATION, etc.). */
  reasons?: string[];
  /** true quando o assessment veio do fallback (env ausente). */
  bypassed: boolean;
};

const ASSESSMENT_TIMEOUT_MS = 5000;

/**
 * Verifica um token reCAPTCHA Enterprise pra ação `action`.
 *
 * @param token Token gerado no frontend via grecaptcha.enterprise.execute()
 * @param action Nome da ação (ex: 'contribute_submit') — precisa bater com o frontend
 */
export async function assessAction(
  token: string | null | undefined,
  action: string,
): Promise<RecaptchaAssessment> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const projectId = process.env.RECAPTCHA_PROJECT_ID;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Fallback dev: sem env, tudo passa. Loga pra deixar claro no terminal.
  if (!secret || !projectId || !siteKey || secret.includes('REPLACE-ME')) {
    // eslint-disable-next-line no-console
    console.log(
      `[recaptcha-bypass] RECAPTCHA_SECRET_KEY/PROJECT_ID ausentes — score=1 forçado pra action=${action}`,
    );
    return { score: 1, valid: true, bypassed: true };
  }

  // Token vazio com captcha configurado → falha
  if (!token) {
    return { score: 0, valid: false, reasons: ['MISSING_TOKEN'], bypassed: false };
  }

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${secret}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: { token, siteKey, expectedAction: action },
      }),
      signal: AbortSignal.timeout(ASSESSMENT_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(`[recaptcha] assessment API retornou ${res.status}`);
      // Em prod, não bloqueia o cidadão por falha do Google — manda pra moderação.
      return { score: 0.5, valid: true, reasons: ['API_ERROR'], bypassed: false };
    }

    const json = (await res.json()) as {
      tokenProperties?: { valid: boolean; action?: string; invalidReason?: string };
      riskAnalysis?: { score: number; reasons?: string[] };
    };

    const valid = json.tokenProperties?.valid === true
      && (!json.tokenProperties.action || json.tokenProperties.action === action);

    return {
      score: json.riskAnalysis?.score ?? 0,
      valid,
      reasons: json.riskAnalysis?.reasons,
      bypassed: false,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[recaptcha] erro verificando token:', (err as Error).message);
    // Falha de rede: também manda pra moderação ao invés de bloquear.
    return { score: 0.5, valid: true, reasons: ['NETWORK_ERROR'], bypassed: false };
  }
}
