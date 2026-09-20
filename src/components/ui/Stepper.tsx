"use client";

import React, {
  Children,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Multi-step walkthrough (ported from React Bits).
 *
 * Restyled onto the Consolid8 tokens — squared corners, signal green instead
 * of the reference purple, and no fixed aspect ratio — so it sits inside a
 * Panel like every other surface. Props and behaviour match the original.
 */

const SIGNAL = "#3fd98b";
const INACTIVE_BG = "#161b22";
const INACTIVE_FG = "#5b6373";

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) onFinalStepCompleted();
    else onStepChange(newStep);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className="flex w-full flex-col" {...rest}>
      <div className={cn("w-full", stepCircleContainerClassName)}>
        <div className={cn("flex w-full items-center pb-4", stepContainerClassName)}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            const onStepClick = (clicked: number) => {
              setDirection(clicked > currentStep ? 1 : -1);
              updateStep(clicked);
            };
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({ step: stepNumber, currentStep, onStepClick })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    currentStep={currentStep}
                    disableStepIndicators={disableStepIndicators}
                    onClickStep={onStepClick}
                  />
                )}
                {isNotLastStep ? (
                  <StepConnector isComplete={currentStep > stepNumber} />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={cn("relative overflow-hidden", contentClassName)}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted ? (
          <div className={cn("pt-4", footerClassName)}>
            <div
              className={cn(
                "flex items-center",
                currentStep !== 1 ? "justify-between" : "justify-end",
              )}
            >
              {currentStep !== 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-sm border border-line-strong bg-surface-raised px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] text-fg-muted uppercase transition-colors duration-200 hover:border-fg-faint hover:text-fg"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              ) : null}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="rounded-sm bg-fg px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-canvas uppercase transition-colors duration-200 hover:bg-white"
                {...nextButtonProps}
              >
                {isLastStep ? "Complete" : nextButtonText}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}) {
  const [parentHeight, setParentHeight] = useState(0);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={
        reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.4 }
      }
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted ? (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={setParentHeight}
          >
            {children}
          </SlideTransition>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%", opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? "50%" : "-50%", opacity: 0 }),
};

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial={reduceMotion ? "center" : "enter"}
      animate="center"
      exit={reduceMotion ? "center" : "exit"}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return <div className="pb-1">{children}</div>;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators,
}: {
  step: number;
  currentStep: number;
  onClickStep: (step: number) => void;
  disableStepIndicators?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const status =
    currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

  return (
    <motion.button
      type="button"
      aria-label={`Step ${step}`}
      aria-current={status === "active" ? "step" : undefined}
      onClick={() => {
        if (step !== currentStep && !disableStepIndicators) onClickStep(step);
      }}
      className="relative cursor-pointer outline-none"
      style={disableStepIndicators ? { pointerEvents: "none", opacity: 0.5 } : {}}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { backgroundColor: INACTIVE_BG, color: INACTIVE_FG },
          active: { backgroundColor: SIGNAL, color: "#07080a" },
          complete: { backgroundColor: SIGNAL, color: "#07080a" },
        }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
        className="num flex size-6 items-center justify-center rounded-sm text-[11px] font-semibold"
      >
        {status === "complete" ? (
          <CheckIcon className="size-3.5" reduceMotion={reduceMotion} />
        ) : (
          <span>{step}</span>
        )}
      </motion.div>
    </motion.button>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <div className="relative mx-2 h-px flex-1 overflow-hidden bg-line-strong">
      <motion.div
        className="absolute top-0 left-0 h-full"
        variants={{
          incomplete: { width: 0, backgroundColor: "transparent" },
          complete: { width: "100%", backgroundColor: SIGNAL },
        }}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: reduceMotion ? 0 : 0.4 }}
      />
    </div>
  );
}

function CheckIcon({
  reduceMotion = false,
  ...props
}: React.SVGProps<SVGSVGElement> & { reduceMotion?: boolean }) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <motion.path
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { delay: 0.1, type: "tween", ease: "easeOut", duration: 0.3 }
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
