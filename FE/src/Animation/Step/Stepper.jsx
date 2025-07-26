/* eslint-disable no-unused-vars */
import React, { useState, Children, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function Stepper({
  children,
  initialStep,
  onStepChange = () => {},
  currentStep: controlledStep, //lấy giá trị của prop currentStep truyền từ cha và gán vào controlledStep
  footerClassName,
  backButtonText,
  nextButtonText,
  ...rest
}) {
  const [uncontrolledStep, setUncontrolledStep] = useState(initialStep);

  const [direction, setDirection] = useState(0); // hướng chuyển động của trang
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  console.log("Total steps:", totalSteps);

  const isControlled = controlledStep !== undefined && controlledStep !== null; // kiểm tra xem có được kiểm soát bởi cha không
  //isControlled sẽ trả ra true hoặc false tùy thuộc vào (controlledStep !== undefined) && controlledStep !== null

  const currentStep = isControlled ? controlledStep : uncontrolledStep; // lấy giá trị của controlledStep nếu có, nếu không thì lấy giá trị của uncontrolledStep
  const [pageInput, setPageInput] = useState(currentStep);

  useEffect(() => {
    setPageInput(currentStep);
  }, [currentStep]);

  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep) => {
    if (newStep < 1 || newStep > totalSteps) {
      toast.error(`Vui lòng nhập số trang hợp lệ từ 1 đến ${totalSteps}.`);
    }
    if (!isControlled) setUncontrolledStep(newStep);
    else onStepChange(newStep);
  };

  const handleBack = () => {
    setDirection(-1);
    updateStep(currentStep - 1);
  };

  const handleNext = () => {
    setDirection(1);
    updateStep(currentStep + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full" {...rest}>
      <div
        className={`w-full rounded-lg bg-transparent`}
        style={{ border: "none", boxShadow: "none" }}
      >
        <StepContentWrapper
          currentStep={currentStep}
          direction={direction}
          className={`space-y-2 `}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        <div className={` ${footerClassName}`}>
          <div className="w-full border-t border-gray-200 px-4 py-4">
            <div
              className="flex flex-wrap items-center justify-center gap-4"
              style={{ rowGap: 12 }}
            >
              {/* Nút "Trang trước" */}
              <button
                onClick={handleBack}
                className={`duration-300 rounded-full border border-blue-500 bg-white px-4 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 cursor-pointer ${
                  currentStep === 1 ? "pointer-events-none opacity-50" : ""
                }`}
                disabled={currentStep === 1}
              >
                {backButtonText}
              </button>

              {/* Hiển thị số trang */}
              <span className="text-sm text-gray-700">
                Trang <strong>{currentStep}</strong> /{" "}
                <strong>{totalSteps}</strong>
              </span>

              <input
                type="number"
                min={1}
                max={totalSteps}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => {
                  const page = Number(pageInput);
                  if (!page || isNaN(page)) {
                    toast.error("Vui lòng nhập số trang hợp lệ.");
                    setPageInput(currentStep);
                    return;
                  }
                  if (page >= 1 && page <= totalSteps) {
                    updateStep(page);
                  } else {
                    toast.error(
                      `Vui lòng nhập số trang từ 1 đến ${totalSteps}.`
                    );
                    setPageInput(currentStep);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const page = Number(pageInput);
                    if (!page || isNaN(page)) {
                      toast.error("Vui lòng nhập số trang hợp lệ.");
                      setPageInput(currentStep);
                      return;
                    }
                    if (page >= 1 && page <= totalSteps) {
                      updateStep(page);
                    } else {
                      toast.error(
                        `Vui lòng nhập số trang từ 1 đến ${totalSteps}.`
                      );
                      setPageInput(currentStep);
                    }
                  }
                }}
                className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                placeholder="Trang"
              />

              {/* Nút "Trang sau" */}
              <button
                onClick={handleNext}
                className={`duration-300 rounded-full border border-blue-500 bg-white px-4 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 cursor-pointer ${
                  currentStep === totalSteps
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
                disabled={isLastStep}
              >
                {nextButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepContentWrapper({ currentStep, direction, children, className }) {
  const [parentHeight, setParentHeight] = useState(0);
  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <SlideTransition
          key={currentStep}
          direction={direction}
          onHeightReady={(h) => setParentHeight(h)}
        >
          {children}
        </SlideTransition>
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }) {
  const containerRef = useRef(null);
  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);
  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%", //phải sang trái
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%", //trái sang phả
    opacity: 0,
  }),
};

export function Step({ children }) {
  return <div className="px-8">{children}</div>;
}
