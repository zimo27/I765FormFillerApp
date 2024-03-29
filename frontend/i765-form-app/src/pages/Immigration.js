import React, { useState } from 'react';

const Immigration = () => {
  const [formState, setFormState] = useState({
    reasonForApplying: '',
    familyName: '',
    givenName: '',
    middleName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process form data
    console.log(formState);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2>Part 1. Reason for Applying</h2>
        <label>
          <input
            type="radio"
            name="reasonForApplying"
            value="initialPermission"
            onChange={handleChange}
            checked={formState.reasonForApplying === 'initialPermission'}
          />
          Initial permission to accept employment.
        </label>
        <label>
          <input
            type="radio"
            name="reasonForApplying"
            value="replacement"
            onChange={handleChange}
            checked={formState.reasonForApplying === 'replacement'}
          />
          Replacement of lost, stolen, or damaged employment authorization document, or correction of my employment authorization document NOT DUE to U.S. Citizenship and Immigration Services (USCIS) error.
        </label>
        <label>
          <input
            type="radio"
            name="reasonForApplying"
            value="renewal"
            onChange={handleChange}
            checked={formState.reasonForApplying === 'renewal'}
          />
          Renewal of my permission to accept employment.
        </label>
      </div>
      <div>
        <h2>Part 2. Information About You</h2>
        <label>
          Your Full Legal Name
          <div>
            <input
              type="text"
              name="familyName"
              placeholder="Family Name (Last Name)"
              onChange={handleChange}
              value={formState.familyName}
            />
          </div>
          <div>
            <input
              type="text"
              name="givenName"
              placeholder="Given Name (First Name)"
              onChange={handleChange}
              value={formState.givenName}
            />
          </div>
          <div>
            <input
              type="text"
              name="middleName"
              placeholder="Middle Name"
              onChange={handleChange}
              value={formState.middleName}
            />
          </div>
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default Immigration;