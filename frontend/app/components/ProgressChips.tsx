import type { OrderState } from '../types/conversation';

interface ProgressChipsProps {
  orderState: OrderState;
}

const ProgressChips = ({
  orderState,
}: ProgressChipsProps) => {
  const steps = [
    { label: "Drink", active: orderState.drink },
    { label: "Size", active: orderState.size },
    { label: "Milk", active: orderState.milk },
    { label: "Name", active: orderState.name },
  ];

  return (
    <>
      <ul className="flex flex-wrap gap-3" aria-label="Order progress">
        {steps.map((chip) => {
          return (
            <li key={chip.label}>
              <span
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-300"
                style={
                  chip.active
                    ? {
                        backgroundColor: "#8B9D83",
                        color: "#FFFFFF",
                        border: "none",
                      }
                    : {
                        backgroundColor: "#C4D0BC",
                        color: "#4A3F35",
                        border: "none",
                      }
                }
                aria-label={`${chip.label} ${
                  chip.active ? "completed" : "not completed"
                }`}
              >
                {chip.active && <span className="mr-2">✓</span>}
                {chip.label}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default ProgressChips;
