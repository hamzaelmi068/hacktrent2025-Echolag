interface ProgressChipsProps {
  currentStep: number;
  orderItems: string[];
  completed: boolean;
}

const ProgressChips = ({
  currentStep = 0,
  orderItems = [],
  completed = false,
}: ProgressChipsProps) => {
  const steps = [
    { label: "Greeting", active: currentStep >= 0 },
    { label: "Order", active: currentStep >= 1 },
    { label: "Customize", active: currentStep >= 2 },
    { label: "Confirm", active: completed },
  ];

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-2" aria-label="Order progress">
        {steps.map((step) => {
          const variantClass = step.active
            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
            : "border-slate-200 bg-white text-slate-600";

          return (
            <li key={step.label}>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${variantClass}`}
                aria-label={`${step.label} ${
                  step.active ? "completed" : "not completed"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>

      {orderItems.length > 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-medium text-slate-700">Order Items:</h3>
          <ul className="mt-2 space-y-1">
            {orderItems.map((item, index) => (
              <li key={index} className="text-sm text-slate-600">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProgressChips;
