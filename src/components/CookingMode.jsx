import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";

export default function CookingMode({ steps, onExit }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  // Prevent the component from breaking if steps is missing or empty.
  if (!steps || steps.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-gray-500 mb-6">
          No cooking instructions are available for this recipe.
        </p>

        <button
          type="button"
          onClick={onExit}
          className="px-6 py-3 rounded-lg border border-gray-300
                     text-gray-700 hover:bg-gray-100 transition"
        >
          Exit Cooking Mode
        </button>
      </div>
    );
  }

  const totalSteps = steps.length;
  const stepNumber = currentStep + 1;

  // Progress percentage.
  const progress = (stepNumber / totalSteps) * 100;

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleFinishCooking() {
    setFinished(true);

    toast.success("🎉 Cooking complete! Enjoy your meal!", {
      duration: 4000,
    });
  }

  // Final completion screen.
  if (finished) {
    return (
      <section className="mt-12">
        <div className="max-w-3xl mx-auto text-center">

          <div className="border border-green-200 bg-green-50 rounded-2xl p-10 shadow-sm">

            <div className="w-20 h-20 mx-auto mb-6 rounded-full
                            bg-green-600 text-white
                            flex items-center justify-center">
              <FaCheck className="text-3xl" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Cooking Complete!
            </h2>

            <p className="text-gray-600 text-lg mb-8">
              Your recipe is finished. Enjoy your meal!
            </p>

            <button
              type="button"
              onClick={onExit}
              className="bg-green-600 text-white px-7 py-3 rounded-lg
                         font-medium hover:bg-green-700
                         transition"
            >
              Back to Recipe
            </button>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">

          <p className="text-green-600 font-semibold uppercase tracking-wide text-sm mb-2">
            Cooking Mode
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Follow the Recipe
          </h2>

        </div>

        {/* Progress */}
        <div className="mb-8">

          <div className="flex items-center justify-between mb-2">

            <span className="font-semibold text-gray-700">
              Step {stepNumber} of {totalSteps}
            </span>

            <span className="text-sm text-gray-500">
              {Math.round(progress)}%
            </span>

          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

            <div
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>

        {/* Current instruction */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 min-h-[260px] flex flex-col justify-center">

          <p className="text-green-600 font-bold text-lg mb-5">
            Step {stepNumber}
          </p>

          <p className="text-xl md:text-2xl leading-relaxed text-gray-700">
            {steps[currentStep]}
          </p>

        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mt-8">

          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-lg
                       border border-gray-300
                       text-gray-700 font-medium
                       hover:bg-gray-100 transition
                       disabled:opacity-40
                       disabled:cursor-not-allowed"
          >
            <FaArrowLeft />
            Previous
          </button>

          {currentStep === totalSteps - 1 ? (

            <button
              type="button"
              onClick={handleFinishCooking}
              className="flex items-center gap-2 px-6 py-3 rounded-lg
                         bg-green-600 text-white font-semibold
                         hover:bg-green-700 transition"
            >
              <FaCheck />
              Finish Cooking
            </button>

          ) : (

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg
                         bg-green-600 text-white font-semibold
                         hover:bg-green-700 transition"
            >
              Next
              <FaArrowRight />
            </button>

          )}

        </div>

        {/* Exit Cooking Mode */}
        <div className="text-center mt-8">

          <button
            type="button"
            onClick={onExit}
            className="text-gray-500 hover:text-red-500
                       font-medium transition"
          >
            Exit Cooking Mode
          </button>

        </div>

      </div>
    </section>
  );
}