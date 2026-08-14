import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const AccordionCard = ({
  title,
  icon,
  children,
  className = '',
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`control-card accordion-card ${isOpen ? 'is-open' : ''} ${className}`.trim()}>
      <button
        type="button"
        className="card-header accordion-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className="accordion-title">
          {icon}
          <h3>{title}</h3>
        </span>
        <ChevronDown size={17} className="accordion-chevron" />
      </button>
      <div className="accordion-content" hidden={!isOpen}>
        {children}
      </div>
    </section>
  );
};
