import React from 'react';
import PropTypes from 'prop-types';

const FilterDropdown = ({ value, onChange, options, ariaLabel }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className="filter-dropdown"
      aria-label={ariaLabel}
    >
      <option value="">All</option>
      {options.map((option, index) => (
        <option key={`${option}-${index}`} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

FilterDropdown.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  ariaLabel: PropTypes.string
};

FilterDropdown.defaultProps = {
  value: '',
  ariaLabel: 'Filter dropdown'
};

export default React.memo(FilterDropdown);