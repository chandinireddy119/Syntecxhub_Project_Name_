import React from 'react';

const steps = [
  { key: 'step1', label: 'Cart' },
  { key: 'step2', label: 'Shipping' },
  { key: 'step3', label: 'Payment' },
  { key: 'step4', label: 'Review' },
];

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const activeMap = { step1, step2, step3, step4 };
  const lastActiveIndex = steps.reduce(
    (acc, step, idx) => (activeMap[step.key] ? idx : acc),
    0
  );

  return (
    <div className="checkout-steps">
      {steps.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div
            className={`checkout-step ${
              idx === lastActiveIndex ? 'active' : idx < lastActiveIndex ? 'done' : ''
            }`}
          >
            <span className="checkout-step-num">{idx + 1}</span>
            <span>{step.label}</span>
          </div>
          {idx < steps.length - 1 && <div className="checkout-step-divider" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
