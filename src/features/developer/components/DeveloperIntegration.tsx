"use client";

import { useState } from "react";
import { BookOpen, Check, CircleCheck, CodeXml, Terminal } from "lucide-react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { CodeBlock } from "@/components/ui/CodeBlock";
import Stepper, { Step } from "@/components/ui/Stepper";
import AnimatedContent from "@/components/ui/AnimatedContent";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/utils";
import { ApiReference } from "./ApiReference";
import { SNIPPETS } from "../snippets";

const STEP_LABELS = [
  "Install",
  "Compile",
  "Verify",
  "Send",
] as const;

interface Annotation {
  label: string;
  value: string;
  tone?: string;
}

/**
 * Feature entry point. How Consolid8 is adopted: four steps, then the
 * contracts the UI itself is built against.
 */
export function DeveloperIntegration() {
  const [completed, setCompleted] = useState(false);
  const [runKey, setRunKey] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelHeader
          title="Integrate Consolid8"
          subtitle={BRAND.descriptor}
          icon={<CodeXml size={13} />}
          actions={
            <span className="num text-[10px] text-fg-dim">
              @consolid8/sdk · v0.1.0
            </span>
          }
        />
        <PanelBody className="py-3">
          {completed ? (
            <div className="flex flex-col items-start gap-3 rounded-md border border-signal/25 bg-signal/[0.05] px-4 py-4">
              <span className="flex items-center gap-2 text-[13px] font-medium text-signal">
                <CircleCheck size={15} />
                Integration complete
              </span>
              <p className="max-w-[62ch] text-[12px] leading-relaxed text-fg-muted">
                Four calls and every request to your model carries verified,
                minimum context. The contracts below are the same ones this
                interface renders.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCompleted(false);
                  setRunKey((key) => key + 1);
                }}
                className="rounded-sm border border-line-strong bg-surface-raised px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] text-fg-muted uppercase transition-colors hover:border-fg-faint hover:text-fg"
              >
                Start over
              </button>
            </div>
          ) : (
            <Stepper
              key={runKey}
              initialStep={1}
              backButtonText="Back"
              nextButtonText="Next"
              onFinalStepCompleted={() => setCompleted(true)}
              stepContainerClassName="pb-3"
              footerClassName="pt-3"
              renderStepIndicator={({ step, currentStep, onStepClick }) => (
                <StepIndicator
                  step={step}
                  currentStep={currentStep}
                  onStepClick={onStepClick}
                />
              )}
            >
              <Step>
                <StepBody
                  step={1}
                  title="Install the SDK"
                  description="One dependency."
                  annotations={[
                    { label: "Package", value: "@consolid8/sdk" },
                    { label: "Version", value: "0.1.0" },
                    { label: "Peer deps", value: "none" },
                    { label: "Runtime", value: "node ≥ 20" },
                  ]}
                >
                  <CodeBlock
                    language="bash"
                    filename="terminal"
                    code={SNIPPETS.install}
                  />
                </StepBody>
              </Step>

              <Step>
                <StepBody
                  step={2}
                  title="Compile a request"
                  description="Pass the messages you would have sent, plus the task the model has to perform. Consolid8 returns the minimum context for that task."
                  annotations={[
                    { label: "Call", value: "compile()" },
                    { label: "Input", value: "messages · task" },
                    { label: "Returns", value: "CompilationResponse" },
                    { label: "Demo run", value: "72,418 → 18,413" },
                  ]}
                >
                  <CodeBlock filename="compile.ts" code={SNIPPETS.quickstart} />
                </StepBody>
              </Step>

              <Step>
                <StepBody
                  step={3}
                  title="Read the verification result"
                  description="Every compilation carries the requirements it checked and whether recovery was needed. Gate on this before you call the model."
                  annotations={[
                    { label: "Gate on", value: "verification.status" },
                    { label: "Attempt 1", value: "11/12 FAIL", tone: "text-danger" },
                    { label: "Recovered", value: "1 requirement", tone: "text-warn" },
                    { label: "Attempt 2", value: "12/12 PASS", tone: "text-signal" },
                  ]}
                >
                  <CodeBlock filename="verify.ts" code={SNIPPETS.verify} />
                </StepBody>
              </Step>

              <Step>
                <StepBody
                  step={4}
                  title="Send the compiled context"
                  description="The compiled context is an ordinary message array. Nothing downstream changes."
                  annotations={[
                    { label: "Shape", value: "ContextUnit[]" },
                    { label: "Sent", value: "18,413 tokens" },
                    { label: "Removed", value: "54,005 tokens" },
                    { label: "Adapter", value: "none" },
                  ]}
                >
                  <CodeBlock filename="call-model.ts" code={SNIPPETS.send} />
                </StepBody>
              </Step>
            </Stepper>
          )}
        </PanelBody>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnimatedContent distance={20} duration={0.45} threshold={0.04}>
          <Panel className="h-full">
            <PanelHeader
              title="REST"
              subtitle="POST /api/compile"
              icon={<Terminal size={13} />}
            />
            <PanelBody className="space-y-3">
              <div>
                <p className="label-xs mb-1.5">Request</p>
                <CodeBlock
                  language="json"
                  filename="request.json"
                  code={SNIPPETS.restRequest}
                />
              </div>
              <div>
                <p className="label-xs mb-1.5">Response</p>
                <CodeBlock
                  language="json"
                  filename="response.json"
                  code={SNIPPETS.restResponse}
                  maxHeight={340}
                />
              </div>
            </PanelBody>
          </Panel>
        </AnimatedContent>

        <AnimatedContent
          distance={20}
          duration={0.45}
          threshold={0.04}
          delay={0.05}
        >
          <Panel className="h-full">
            <PanelHeader
              title="Response contract"
              subtitle="The types this UI is built against"
              icon={<BookOpen size={13} />}
            />
            <PanelBody>
              <CodeBlock
                filename="types/compilation.ts"
                code={SNIPPETS.types}
                maxHeight={520}
              />
            </PanelBody>
          </Panel>
        </AnimatedContent>
      </div>

      <ApiReference />
    </div>
  );
}

/**
 * Replaces the Stepper's default dot so the rail carries a name per step and
 * keeps a visible focus ring — the built-in indicator sets `outline-none`.
 * Left/right arrows move between steps from the keyboard.
 */
function StepIndicator({
  step,
  currentStep,
  onStepClick,
}: {
  step: number;
  currentStep: number;
  onStepClick: (clicked: number) => void;
}) {
  const total = STEP_LABELS.length;
  const label = STEP_LABELS[step - 1] ?? `Step ${step}`;
  const status =
    currentStep === step ? "active" : currentStep > step ? "complete" : "pending";

  return (
    <button
      type="button"
      data-step-indicator={step}
      aria-current={status === "active" ? "step" : undefined}
      aria-label={`Step ${step} of ${total}: ${label}${
        status === "complete" ? " (done)" : ""
      }`}
      onClick={() => {
        if (step !== currentStep) onStepClick(step);
      }}
      onKeyDown={(event) => {
        const delta =
          event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!delta) return;
        const next = step + delta;
        if (next < 1 || next > total) return;
        event.preventDefault();
        onStepClick(next);
        document
          .querySelector<HTMLButtonElement>(`[data-step-indicator="${next}"]`)
          ?.focus();
      }}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-2 rounded-sm px-1 py-0.5 transition-colors",
        status === "pending" ? "text-fg-dim hover:text-fg-muted" : "text-fg",
      )}
    >
      <span
        className={cn(
          "num flex size-6 items-center justify-center rounded-sm text-[11px] font-semibold",
          status === "pending"
            ? "bg-surface-raised text-fg-dim"
            : "bg-signal text-canvas",
        )}
      >
        {status === "complete" ? <Check size={13} aria-hidden /> : step}
      </span>
      <span
        className={cn(
          "label-xs hidden sm:inline",
          status === "active" ? "text-fg" : undefined,
        )}
      >
        {label}
      </span>
    </button>
  );
}

function StepBody({
  step,
  title,
  description,
  annotations,
  children,
}: {
  step: number;
  title: string;
  description: string;
  annotations: Annotation[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2.5">
        <span className="num text-[10px] tracking-[0.09em] text-fg-dim uppercase">
          Step {step}/{STEP_LABELS.length}
        </span>
        <h3 className="text-[14px] font-medium text-fg">{title}</h3>
      </div>
      <p className="mt-1 mb-2.5 max-w-[92ch] text-[12px] leading-relaxed text-fg-muted">
        {description}
      </p>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_268px]">
        <div className="min-w-0">{children}</div>
        <dl className="grid content-start gap-px overflow-hidden rounded-md border border-line bg-line">
          {annotations.map((annotation) => (
            <div
              key={annotation.label}
              className="flex items-baseline justify-between gap-3 bg-surface-inset px-2.5 py-[7px]"
            >
              <dt className="label-xs shrink-0">{annotation.label}</dt>
              <dd
                className={cn(
                  "num truncate text-[11px]",
                  annotation.tone ?? "text-fg-muted",
                )}
              >
                {annotation.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
