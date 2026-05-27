'use client';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { toast } from 'sonner';
import {
  INITIAL_FORM_STATE,
  type Category,
  type ContributionError,
  type ContributionSuccess,
  type FormState,
} from '@/lib/contribution/types';
import { ProgressBar } from './progress-bar';
import { StepWhere } from './step-where';
import { StepCategory } from './step-category';
import { StepMacroarea } from './step-macroarea';
import { StepBody } from './step-body';
import { StepAttachments } from './step-attachments';
import { StepIdentification } from './step-identification';
import { StepConsent } from './step-consent';
import { StepConfirmation } from './step-confirmation';

/**
 * Orquestrador do wizard /contribuir. PRD v1.0 §5.5.
 *
 * Decisão de arquitetura: useReducer + Zod no submit (sem react-hook-form).
 * Justificativa: 8 etapas com validação condicional ficam mais previsíveis
 * com state machine explícito.
 *
 * Persistência: sessionStorage (LGPD-safe — some quando fecha aba).
 */

const TOTAL_STEPS = 8;
const STORAGE_KEY = 'tp:contribuir:draft:v1';

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'patch'; payload: Partial<FormState> }
  | { type: 'reset' }
  | { type: 'rehydrate'; payload: FormState };

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'reset':
      return INITIAL_FORM_STATE;
    case 'rehydrate':
      return action.payload;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Validação por etapa (apenas client-side; Zod definitivo no /api/contribute)
// ---------------------------------------------------------------------------

export type StepValidationError = { field: string; message: string };

function validateStep(step: number, state: FormState): StepValidationError[] {
  const errs: StepValidationError[] = [];
  switch (step) {
    case 1: // Onde
      if (!state.no_specific_location && !state.location_address.trim()) {
        errs.push({
          field: 'location_address',
          message:
            'Informe um endereço ou marque "Não tem local específico".',
        });
      }
      break;
    case 2: // Categoria
      if (!state.category) {
        errs.push({
          field: 'category',
          message: 'Escolha uma categoria.',
        });
      }
      break;
    case 3: // Macroárea — opcional ("Não sei" é válido)
      break;
    case 4: // Body
      if (state.body.trim().length < 50) {
        errs.push({
          field: 'body',
          message: `Sua contribuição precisa ter pelo menos 50 caracteres (faltam ${
            Math.max(0, 50 - state.body.trim().length)
          }).`,
        });
      }
      break;
    case 5: // Anexos — opcional
      if (state.attachments.length > 3) {
        errs.push({ field: 'attachments', message: 'Máximo de 3 anexos.' });
      }
      for (const a of state.attachments) {
        if (a.size > 5 * 1024 * 1024) {
          errs.push({
            field: 'attachments',
            message: `Anexo "${a.name}" maior que 5 MB.`,
          });
        }
      }
      break;
    case 6: // Identificação
      if (!state.identification_mode) {
        errs.push({
          field: 'identification_mode',
          message: 'Escolha como você quer contribuir.',
        });
      }
      if (state.identification_mode === 'identified') {
        if (state.identification_name.trim().length < 2) {
          errs.push({
            field: 'identification_name',
            message: 'Informe seu nome (mín. 2 caracteres).',
          });
        }
        const email = state.identification_email.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errs.push({
            field: 'identification_email',
            message: 'E-mail inválido.',
          });
        }
        const cpfDigits = state.identification_cpf.replace(/\D/g, '');
        if (cpfDigits.length > 0 && cpfDigits.length !== 11) {
          errs.push({
            field: 'identification_cpf',
            message: 'CPF deve ter 11 dígitos.',
          });
        }
      }
      break;
    case 7: // Consentimento
      if (!state.consent_lgpd) {
        errs.push({
          field: 'consent_lgpd',
          message: 'Você precisa concordar com o tratamento dos dados.',
        });
      }
      break;
    default:
      break;
  }
  return errs;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  /**
   * Categoria pré-selecionada vinda da URL (`?category=habitacao`).
   * Sobrescreve o que estiver no sessionStorage — clicar em "Contribuir sobre X"
   * no /diagnostico deve refletir a intenção do clique mesmo se houver draft.
   */
  initialCategory?: Category;
  /**
   * Macroárea pré-selecionada vinda da URL (`?from_macroarea=centro-tamandare`).
   * Disparada por links em /zoneamento e /zoneamento/[slug].
   */
  initialMacroarea?: string;
};

export function ContributionWizard({
  initialCategory,
  initialMacroarea,
}: Props = {}) {
  const [step, setStep] = useState(1);
  const [state, dispatch] = useReducer(reducer, null, () => ({
    ...INITIAL_FORM_STATE,
    category: initialCategory ?? null,
    macroarea_slug: initialMacroarea ?? null,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ContributionSuccess | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // ----- Rehydrate from sessionStorage ---------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { state: FormState; step: number };
        if (parsed?.state) {
          // Importante (LGPD): não rehidratar consent — o usuário precisa
          // marcar a caixa novamente em cada sessão.
          dispatch({
            type: 'rehydrate',
            payload: { ...parsed.state, consent_lgpd: false },
          });
          if (typeof parsed.step === 'number' && parsed.step >= 1 && parsed.step <= 7) {
            // Se ele estava no step 7 (consent), volta um — precisa reler.
            setStep(parsed.step === 7 ? 6 : parsed.step);
          }
        }
      }
    } catch {
      // ignora — sessão corrompida não bloqueia novo formulário
    }
    // URL `?category=X` e `?from_macroarea=Y` sempre vencem o sessionStorage:
    // se o usuário clicou em "Contribuir sobre X" no /diagnostico ou em
    // "Contribuir sobre esta macroárea" no /zoneamento, a intenção do clique
    // sobrescreve qualquer draft antigo nesses dois campos.
    const urlPatch: Partial<FormState> = {};
    if (initialCategory) urlPatch.category = initialCategory;
    if (initialMacroarea) {
      urlPatch.macroarea_slug = initialMacroarea;
      urlPatch.macroarea_unknown = false;
    }
    if (Object.keys(urlPatch).length > 0) {
      dispatch({ type: 'patch', payload: urlPatch });
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Persist on every change (após hydrate) ------------------------------
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    if (result) return; // não persistir depois do sucesso
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state, step }),
      );
    } catch {
      // quota ou sessão privada — silent
    }
  }, [state, step, hydrated, result]);

  const patch = useCallback((p: Partial<FormState>) => {
    dispatch({ type: 'patch', payload: p });
    // limpa erros dos campos sendo editados
    setErrors((cur) => {
      const next = { ...cur };
      for (const k of Object.keys(p)) delete next[k];
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(step, state);
    if (stepErrors.length > 0) {
      const map: Record<string, string> = {};
      for (const e of stepErrors) map[e.field] = e.message;
      setErrors(map);
      toast.error(stepErrors[0].message);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, state]);

  const handleBack = useCallback(() => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const jumpTo = useCallback(
    (target: number) => {
      // backward sempre permitido; forward não pula validação
      if (target <= step) {
        setErrors({});
        setStep(target);
      }
    },
    [step],
  );

  const handleSubmit = useCallback(async () => {
    const stepErrors = validateStep(7, state);
    if (stepErrors.length > 0) {
      const map: Record<string, string> = {};
      for (const e of stepErrors) map[e.field] = e.message;
      setErrors(map);
      toast.error(stepErrors[0].message);
      return;
    }

    setSubmitting(true);
    const payload = {
      category: state.category,
      macroarea_slug: state.macroarea_unknown ? null : state.macroarea_slug,
      location_address: state.no_specific_location
        ? null
        : state.location_address.trim() || null,
      no_specific_location: state.no_specific_location,
      body: state.body.trim(),
      audio_url: state.audio_url,
      attachments: state.attachments,
      identification:
        state.identification_mode === 'identified'
          ? {
              mode: 'identified' as const,
              name: state.identification_name.trim(),
              email: state.identification_email.trim().toLowerCase(),
              cpf: state.identification_cpf.replace(/\D/g, '') || undefined,
            }
          : { mode: 'anonymous' as const },
      consent_lgpd: state.consent_lgpd,
      // reCAPTCHA: site key não configurada → null. Server faz bypass dev.
      recaptcha_token: null,
    };

    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as ContributionSuccess;
        setResult(data);
        setStep(8);
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
        toast.success('Contribuição recebida!');
      } else {
        const err = (await res.json()) as ContributionError;
        if (err.field_errors) {
          setErrors(err.field_errors);
          // Encontra o menor step que tem erro e volta pra lá
          const fieldToStep: Record<string, number> = {
            location_address: 1,
            no_specific_location: 1,
            category: 2,
            macroarea_slug: 3,
            body: 4,
            attachments: 5,
            identification: 6,
            'identification.name': 6,
            'identification.email': 6,
            'identification.cpf': 6,
            'identification.mode': 6,
            consent_lgpd: 7,
          };
          const stepsWithErrors = Object.keys(err.field_errors)
            .map((k) => fieldToStep[k] ?? fieldToStep[k.split('.')[0]] ?? 7)
            .filter((n) => Number.isFinite(n));
          if (stepsWithErrors.length > 0) {
            setStep(Math.min(...stepsWithErrors));
          }
        }
        toast.error(err.detail ?? err.error ?? 'Erro ao enviar.');
      }
    } catch (err) {
      toast.error('Sem conexão. Verifique sua internet e tente novamente.');
      // eslint-disable-next-line no-console
      console.error('[contribute] submit network error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [state]);

  const handleStartOver = useCallback(() => {
    dispatch({ type: 'reset' });
    setResult(null);
    setErrors({});
    setStep(1);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ----- Renderização --------------------------------------------------------

  const currentStepNode = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <StepWhere
            value={{
              location_address: state.location_address,
              no_specific_location: state.no_specific_location,
            }}
            onChange={patch}
            errors={errors}
          />
        );
      case 2:
        return (
          <StepCategory
            value={state.category}
            onChange={(c: Category) => patch({ category: c })}
            errors={errors}
          />
        );
      case 3:
        return (
          <StepMacroarea
            value={state.macroarea_slug}
            unknown={state.macroarea_unknown}
            onChange={patch}
            errors={errors}
          />
        );
      case 4:
        return (
          <StepBody
            value={state.body}
            audioUrl={state.audio_url}
            onChange={patch}
            errors={errors}
          />
        );
      case 5:
        return (
          <StepAttachments
            value={state.attachments}
            onChange={(attachments) => patch({ attachments })}
            errors={errors}
          />
        );
      case 6:
        return (
          <StepIdentification
            mode={state.identification_mode}
            name={state.identification_name}
            email={state.identification_email}
            cpf={state.identification_cpf}
            onChange={patch}
            errors={errors}
          />
        );
      case 7:
        return (
          <StepConsent
            value={state.consent_lgpd}
            onChange={(consent_lgpd: boolean) => patch({ consent_lgpd })}
            errors={errors}
          />
        );
      case 8:
        return result ? (
          <StepConfirmation result={result} onStartOver={handleStartOver} />
        ) : null;
      default:
        return null;
    }
  }, [step, state, errors, patch, result, handleStartOver]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      {step < 8 && (
        <ProgressBar current={step} total={TOTAL_STEPS - 1} onJump={jumpTo} />
      )}

      <div className="mt-6 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6 md:p-8">
        {currentStepNode}
      </div>

      {step < 8 && (
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="min-h-[44px] rounded-md border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Voltar
          </button>

          {step < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[44px] rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="min-h-[44px] rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              aria-busy={submitting}
            >
              {submitting ? 'Enviando…' : 'Enviar contribuição'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
