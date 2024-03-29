import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/I765Form.module.css'; // Import the CSS module
import WebHeader from './WebHeader';


const initialFormData = {
  id: 0,
  reasonForApplying: '',
  familyName: '', 
  givenName: '', 
  middleName: '' ,

  familyName2a: '',
  givenName2b: '',
  middleName2c: '',
  familyName3a: '',
  givenName3b: '',
  middleName3c: '',
  familyName4a: '',
  givenName4b: '',
  middleName4c: '',

  mailingInCareOf: '',
  mailingStreet: '',
  mailingAddressType: '',  // 'mailingApt', 'mailingSte', or 'mailingFlr'
  mailingUnit: '',
  mailingCity: '',
  mailingState: '',
  mailingZip: '',

  mailingIsSameAsPhysical: '',

  physicalStreet: '',
  physicalAddressType: '',
  physicalUnit: '',
  physicalCity: '',
  physicalState: '',
  physicalZip: '',

  alienRegistrationNumber: '',
  uscisOnlineAccountNumber: '',
  gender: '',
  maritalStatus: '',
  filedI765: '',
  ssaCardIssued: '',
  ssn: '',
  wantsSsaCard: '',
  consentForDisclosure: '',

  fatherFamilyName: '',
  fatherGivenName: '',
  motherFamilyName: '',
  motherGivenName: '',
  
};

function I765Form() {
  const [formData, setFormData] = useState(initialFormData);

  // this function gets the maxid in the application table and generate a new id
  useEffect(() => {
    const fetchMaxId = async () => {
      try {
        const response = await axios.get('https://i765app-production.up.railway.app/get-max-id');
        const newId = response.data.max_id + 1;
        console.log('Max ID:', newId);
        setFormData(prevFormData => ({
          ...prevFormData,
          id: newId
        }));
      } catch (error) {
        console.error('There was an error fetching the max ID:', error);
      }
    };
  
    fetchMaxId();
  }, []);
   

  const [retrieveId, setRetrieveId] = useState('');
  const handleRetrieveIdChange = (event) => {
    setRetrieveId(event.target.value);
  };

  const handleRetrieve = async (inputId) => {
    try {
      //window.location.reload()
      const url = `https://i765app-production.up.railway.app/retrieve-application?inputId=${inputId}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        updateFormData(data);
      } else {
        console.error('Failed to fetch data:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  // Function to update formData based on the retrieved data
  const updateFormData = (receivedData) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      ...receivedData
    }));
  };

  const [showMoreNames, setShowMoreNames] = useState(false);

  const toggleMoreNames = () => {
    setShowMoreNames(!showMoreNames);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
        const response = await fetch('https://i765app-production.up.railway.app/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const responseBody = await response.json();

        console.log(responseBody);

        if (response.ok) {
            alert('Application submitted successfully! Your form id is ' + formData.id);
        } else {
            alert('Failed to submit application.');
        }
    } catch (error) {
        // Handle network errors
        console.error('Error:', error);
        alert('Error submitting application.');
    }
};


  const handleDownloadPDF = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const url = 'https://i765app-production.up.railway.app/fill-pdf';
      const response = await axios.post(url, formData, { responseType: 'blob' });
      // Create a URL for the PDF
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', 'filled-i-756.pdf'); // Set the file name
      document.body.appendChild(fileLink);
      fileLink.click();
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error downloading the PDF', error);
    }
  }

  return (
    <div>
      <WebHeader />
    
    <div className={styles.content}>
    
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>Form I-765</h1>

      <div className='retrieve'>
        
        <span className='span1'>Retrieve my previous form with the form id: </span>
        <input
          type="text"
          name="inputId"
          placeholder='40'
          onChange={handleRetrieveIdChange}
        />
        <button type='button' onClick={()=>handleRetrieve(retrieveId)}>retrieve</button>
      </div>
      <hr/> 
      {/* Reason for Applying */}
      <h2>Part 1. Reason for Applying</h2>
      <h3>I am applying for</h3>
      <div>
        <label className="label-container">
          <input
            type="radio"
            name="reasonForApplying"
            value="initialPermission"
            onChange={handleInputChange}
            checked={formData.reasonForApplying === 'initialPermission'}
          />
          Initial permission to accept employment.
        </label>
      </div>
      <div>
        <label className="label-container">
          <input
            type="radio"
            name="reasonForApplying"
            value="replacement"
            onChange={handleInputChange}
            checked={formData.reasonForApplying === 'replacement'}
          />
          Replacement of lost, stolen, or damaged employment authorization document, or correction of my employment authorization document NOT DUE to U.S. Citizenship and Immigration Services (USCIS) error.
        </label>
      </div>
      <div>
        <label className="label-container">
          <input
            type="radio"
            name="reasonForApplying"
            value="renewal"
            onChange={handleInputChange}
            checked={formData.reasonForApplying === 'renewal'}
          />
          Renewal of my permission to accept employment.
        </label>
      </div>

      
      
        <h2>Part 2. Information About You</h2>
        <label>
          Your Full Legal Name
          <div className="input-container">
          Family Name (Last Name)
            <input
              type="text"
              name="familyName"
              onChange={handleInputChange}
              value={formData.familyName}
            />
          </div>
          <div className="input-container">
            Given Name (First Name)
            <input
              type="text"
              name="givenName"
              onChange={handleInputChange}
              value={formData.givenName}
            />
          </div>
          <div className="input-container">
            Middle Name
            <input
              type="text"
              name="middleName"
              onChange={handleInputChange}
              value={formData.middleName}
            />
          </div>
        </label>
      
        <div className="other-names-form">
      <h3>Other Names Used</h3>
      <p>Provide all other names you have ever used, including aliases, maiden name, and nicknames. If you need extra space to complete this section, use the space provided in Part 6. Additional Information.</p>
      
      {/* Family Name 2a */}
      <label>
        2.a. Family Name (Last Name)
        <input
          type="text"
          name="familyName2a"
          value={formData.familyName2a}
          onChange={handleInputChange}
        />
      </label>
      
      {/* Given Name 2b */}
      <label>
        2.b. Given Name (First Name)
        <input
          type="text"
          name="givenName2b"
          value={formData.givenName2b}
          onChange={handleInputChange}
        />
      </label>
      
      {/* Middle Name 2c */}
      <label>
        2.c. Middle Name
        <input
          type="text"
          name="middleName2c"
          value={formData.middleName2c}
          onChange={handleInputChange}
        />
      </label>
      

      {/* Toggle button for additional names */}
      <button type="button" onClick={toggleMoreNames}>
        {showMoreNames ? 'Hide Additional Names' : 'Add Additional Names'}
      </button>

      {showMoreNames && (
        <>
          {/* Family Name 3a */}
          <div>
            <label>
              3.a. Family Name (Last Name)
              <input
                type="text"
                name="familyName3a"
                value={formData.familyName3a}
                onChange={handleInputChange}
              />
            </label>
          </div>
          
          {/* Given Name 3b */}
          <div>
            <label>
              3.b. Given Name (First Name)
              <input
                type="text"
                name="givenName3b"
                value={formData.givenName3b}
                onChange={handleInputChange}
              />
            </label>
          </div>
          
          {/* Middle Name 3c */}
          <div>
            <label>
              3.c. Middle Name
              <input
                type="text"
                name="middleName3c"
                value={formData.middleName3c}
                onChange={handleInputChange}
              />
            </label>
          </div>
          
          {/* Family Name 4a */}
          <div>
            <label>
              4.a. Family Name (Last Name)
              <input
                type="text"
                name="familyName4a"
                value={formData.familyName4a}
                onChange={handleInputChange}
              />
            </label>
          </div>
          
          {/* Given Name 4b */}
          <div>
            <label>
              4.b. Given Name (First Name)
              <input
                type="text"
                name="givenName4b"
                value={formData.givenName4b}
                onChange={handleInputChange}
              />
            </label>
          </div>
          
          {/* Middle Name 4c */}
          <div>
            <label>
              4.c. Middle Name
              <input
                type="text"
                name="middleName4c"
                value={formData.middleName4c}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </>
      )}

      
    </div>

      <h2>Part 2. Information About You (continued)</h2>
      <div>
        <label>
          5.a. In Care Of Name (if any)
          <input type="text" name="mailingInCareOf" value={formData.mailingInCareOf} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <label>
          5.b. Street Number and Name
          <input type="text" name="mailingStreet" value={formData.mailingStreet} onChange={handleInputChange} />
        </label>
      
        <label>
        
        <input
          type="radio"
          name="mailingAddressType"
          value="mailingApt"
          onChange={handleInputChange}
          checked={formData.mailingAddressType === 'mailingApt'}
        /> Apt
      </label>
      <label>
        
        <input
          type="radio"
          name="mailingAddressType"
          value="mailingSte"
          onChange={handleInputChange}
          checked={formData.mailingAddressType === 'mailingSte'}
        /> Ste
      </label>
      <label>
        
        <input
          type="radio"
          name="mailingAddressType"
          value="mailingFlr"
          onChange={handleInputChange}
          checked={formData.mailingAddressType === 'mailingFlr'}
        /> Flr
      </label>
      <label>
        <input
          type="text"
          name="mailingUnit"
          value={formData.mailingUnit}
          onChange={handleInputChange}
          placeholder="Unit"
        />
      </label>
        </div>
      
      <div>
        <label>
          5.d. City or Town
          <input type="text" name="mailingCity" value={formData.mailingCity} onChange={handleInputChange} />
        </label>
      </div>
      <div>
      5.e. State
      <select name="mailingState" value={formData.mailingState} onChange={handleInputChange}>
        <option value="" disabled>Select a state</option>
        <option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="AR">Arkansas</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="CT">Connecticut</option>
        <option value="DE">Delaware</option>
        <option value="FL">Florida</option>
        <option value="GA">Georgia</option>
        <option value="HI">Hawaii</option>
        <option value="ID">Idaho</option>
        <option value="IL">Illinois</option>
        <option value="IN">Indiana</option>
        <option value="IA">Iowa</option>
        <option value="KS">Kansas</option>
        <option value="KY">Kentucky</option>
        <option value="LA">Louisiana</option>
        <option value="ME">Maine</option>
        <option value="MD">Maryland</option>
        <option value="MA">Massachusetts</option>
        <option value="MI">Michigan</option>
        <option value="MN">Minnesota</option>
        <option value="MS">Mississippi</option>
        <option value="MO">Missouri</option>
        <option value="MT">Montana</option>
        <option value="NE">Nebraska</option>
        <option value="NV">Nevada</option>
        <option value="NH">New Hampshire</option>
        <option value="NJ">New Jersey</option>
        <option value="NM">New Mexico</option>
        <option value="NY">New York</option>
        <option value="NC">North Carolina</option>
        <option value="ND">North Dakota</option>
        <option value="OH">Ohio</option>
        <option value="OK">Oklahoma</option>
        <option value="OR">Oregon</option>
        <option value="PA">Pennsylvania</option>
        <option value="RI">Rhode Island</option>
        <option value="SC">South Carolina</option>
        <option value="SD">South Dakota</option>
        <option value="TN">Tennessee</option>
        <option value="TX">Texas</option>
        <option value="UT">Utah</option>
        <option value="VT">Vermont</option>
        <option value="VA">Virginia</option>
        <option value="WA">Washington</option>
        <option value="WV">West Virginia</option>
        <option value="WI">Wisconsin</option>
        <option value="WY">Wyoming</option>
      </select>

      </div>
      <div>
        <label>
          5.f. ZIP Code
          <input type="text" name="mailingZip" value={formData.mailingZip} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <label>
          6. Is your current mailing address the same as your physical address?
          <label>
            <input type="radio" name="mailingIsSameAsPhysical" value="Yes" onChange={handleInputChange} checked={formData.mailingIsSameAsPhysical === 'Yes'} /> Yes (skips 7)
          </label>
          <label>
            <input type="radio" name="mailingIsSameAsPhysical" value="No" onChange={handleInputChange} checked={formData.mailingIsSameAsPhysical === 'No'} /> No
          </label>
          
        </label>
      </div>
      {formData.mailingIsSameAsPhysical === "No" && (
      <div>
        <div>
          <label>
            7.a. Street Number and Name
            <input type="text" name="physicalStreet" value={formData.physicalStreet} onChange={handleInputChange} />
          </label>
        </div>
        <div>
      <label>
        
        <input
          type="radio"
          name="physicalAddressType"
          value="physicalApt"
          onChange={handleInputChange}
          checked={formData.physicalAddressType === 'physicalApt'}
        /> Apt
      </label>
      <label>
        
        <input
          type="radio"
          name="physicalAddressType"
          value="physicalSte"
          onChange={handleInputChange}
          checked={formData.physicalAddressType === 'physicalSte'}
        /> Ste
      </label>
      <label>
        
        <input
          type="radio"
          name="physicalAddressType"
          value="physicalFlr"
          onChange={handleInputChange}
          checked={formData.physicalAddressType === 'physicalFlr'}
        /> Flr
      </label>
      <label>
        <input
          type="text"
          name="physicalUnit"
          value={formData.physicalUnit}
          onChange={handleInputChange}
          placeholder="Unit"
        />
      </label>
      </div>
        <div>
          <label>
            7.c. City or Town
            <input type="text" name="physicalCity" value={formData.physicalCity} onChange={handleInputChange} />
          </label>
        </div>
        <div>
          <label>
            7.d. State
            <select name="physicalState" value={formData.physicalState} onChange={handleInputChange}>
        <option value="" disabled>Select a state</option>
        <option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="AR">Arkansas</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="CT">Connecticut</option>
        <option value="DE">Delaware</option>
        <option value="FL">Florida</option>
        <option value="GA">Georgia</option>
        <option value="HI">Hawaii</option>
        <option value="ID">Idaho</option>
        <option value="IL">Illinois</option>
        <option value="IN">Indiana</option>
        <option value="IA">Iowa</option>
        <option value="KS">Kansas</option>
        <option value="KY">Kentucky</option>
        <option value="LA">Louisiana</option>
        <option value="ME">Maine</option>
        <option value="MD">Maryland</option>
        <option value="MA">Massachusetts</option>
        <option value="MI">Michigan</option>
        <option value="MN">Minnesota</option>
        <option value="MS">Mississippi</option>
        <option value="MO">Missouri</option>
        <option value="MT">Montana</option>
        <option value="NE">Nebraska</option>
        <option value="NV">Nevada</option>
        <option value="NH">New Hampshire</option>
        <option value="NJ">New Jersey</option>
        <option value="NM">New Mexico</option>
        <option value="NY">New York</option>
        <option value="NC">North Carolina</option>
        <option value="ND">North Dakota</option>
        <option value="OH">Ohio</option>
        <option value="OK">Oklahoma</option>
        <option value="OR">Oregon</option>
        <option value="PA">Pennsylvania</option>
        <option value="RI">Rhode Island</option>
        <option value="SC">South Carolina</option>
        <option value="SD">South Dakota</option>
        <option value="TN">Tennessee</option>
        <option value="TX">Texas</option>
        <option value="UT">Utah</option>
        <option value="VT">Vermont</option>
        <option value="VA">Virginia</option>
        <option value="WA">Washington</option>
        <option value="WV">West Virginia</option>
        <option value="WI">Wisconsin</option>
        <option value="WY">Wyoming</option>
      </select>
          </label>
        </div>
        <div>
          <label>
            7.e. ZIP Code
            <input type="text" name="physicalZip" value={formData.physicalZip} onChange={handleInputChange} />
          </label>
        </div>
        </div>
      )}


      <div>
        <label>
          8. Alien Registration Number (A-Number) (if any)
          <input type="text" name="alienRegistrationNumber" value={formData.alienRegistrationNumber} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <label>
          9. USCIS Online Account Number (if any)
          <input type="text" name="uscisOnlineAccountNumber" value={formData.uscisOnlineAccountNumber} onChange={handleInputChange} />
        </label>
      </div>
      <div>
        <h3>10. Gender</h3>
        <label>
          <input type="radio" name="gender" value="Male" onChange={handleInputChange} checked={formData.gender === 'Male'} /> Male
        </label>
        <label>
          <input type="radio" name="gender" value="Female" onChange={handleInputChange} checked={formData.gender === 'Female'} /> Female
        </label>
      </div>
      <div>
        <h3>11. Marital Status</h3>
        <label>
          <input type="radio" name="maritalStatus" value="Single" onChange={handleInputChange} checked={formData.maritalStatus === 'Single'} /> Single
        </label>
        <label>
          <input type="radio" name="maritalStatus" value="Married" onChange={handleInputChange} checked={formData.maritalStatus === 'Married'} /> Married
        </label>
        <label>
          <input type="radio" name="maritalStatus" value="Divorced" onChange={handleInputChange} checked={formData.maritalStatus === 'Divorced'} /> Divorced
        </label>
        <label>
          <input type="radio" name="maritalStatus" value="Widowed" onChange={handleInputChange} checked={formData.maritalStatus === 'Widowed'} /> Widowed
        </label>

      </div>
      <div>
        <label>
          <h3>12. Have you previously filed Form I-765?</h3>
          <label>
            <input type="radio" name="filedI765" value="Yes" onChange={handleInputChange} checked={formData.filedI765 === 'Yes'} /> Yes
          </label>
          <label>
            <input type="radio" name="filedI765" value="No" onChange={handleInputChange} checked={formData.filedI765 === 'No'} /> No
          </label>
        </label>
      </div>
      <div>
        <label>
          <h3>13.a. Has the Social Security Administration (SSA) ever officially issued a Social Security card to you?</h3>
          <label>
            <input type="radio" name="ssaCardIssued" value="Yes" onChange={handleInputChange} checked={formData.ssaCardIssued === 'Yes'} /> Yes
          </label>
          <label>
            <input type="radio" name="ssaCardIssued" value="No" onChange={handleInputChange} checked={formData.ssaCardIssued === 'No'} /> No
          </label>
        </label>
      </div>
      {formData.ssaCardIssued === "Yes" && (
        <div>
          <label>
            <h3>13.b. Provide your Social Security number (SSN) (if known).</h3>
            <input type="text" name="ssn" value={formData.ssn} onChange={handleInputChange} />
          </label>
        </div>
      )}
      <div>
        <label>
          <h3>14. Do you want the SSA to issue you a Social Security card?</h3>
          <label>
            <input type="radio" name="wantsSsaCard" value="Yes" onChange={handleInputChange} checked={formData.wantsSsaCard === 'Yes'} /> Yes
          </label>
          <label>
            <input type="radio" name="wantsSsaCard" value="No" onChange={handleInputChange} checked={formData.wantsSsaCard === 'No'} /> No (skips 15 16 17)
          </label>
        </label>
      </div>
      {formData.wantsSsaCard === "Yes" && (
        <div>
          <label>
            <h3>15. Consent for Disclosure:</h3>
            I authorize disclosure of information from this application to the SSA as required for the purpose of assigning me an SSN and issuing me a Social Security card.
            <label>
              <input type="radio" name="consentForDisclosure" value="Yes" onChange={handleInputChange} checked={formData.consentForDisclosure === 'Yes'} /> Yes
            </label>
            <label>
              <input type="radio" name="consentForDisclosure" value="No" onChange={handleInputChange} checked={formData.consentForDisclosure === 'No'} /> No (skips 16 17)
            </label>
          </label>

          {formData.consentForDisclosure === "Yes" && (
            <div>
              <div>
                <label>
                  16.a. Father's Family Name
                  <input type="text" name="fatherFamilyName" value={formData.fatherFamilyName} onChange={handleInputChange} />
                </label>
              </div>
              <div>
                <label>
                  16.b. Father's Given Name
                  <input type="text" name="fatherGivenName" value={formData.fatherGivenName} onChange={handleInputChange} />
                </label>
              </div>
              <div>
                <label>
                  17.a. Mother's Family Name
                  <input type="text" name="motherFamilyName" value={formData.motherFamilyName} onChange={handleInputChange} />
                </label>
              </div>
              <div>
                <label>
                  17.b. Mother's Given Name
                  <input type="text" name="motherGivenName" value={formData.motherGivenName} onChange={handleInputChange} />
                </label>
              </div>
              </div>
          )}
        </div>
        
      )}

      <button type="submit" onClick={handleSubmit}>Submit</button>
      <button type="button" onClick={handleDownloadPDF}>Download as PDF</button>
    </form>
    </div>
    </div>
  );
}

export default I765Form;
