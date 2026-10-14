export default function Instructions({ steps }) {
  return (
    <div className="mt-12">

      <h2 className="text-3xl font-bold mb-6">
        Instructions
      </h2>

      {steps.map((step, index) => (
        <p key={step} className="mb-4">
          <strong>Step {index + 1}.</strong> {step}
        </p>
      ))}

    </div>
  );
}