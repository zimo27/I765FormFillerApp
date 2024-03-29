from flask import Flask, request, jsonify, Response
import fitz
import os
from flask_cors import CORS
import io
import sqlite3
app = Flask(__name__)


CORS(app)

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    # applications table
    # AUTOINCREMENT
    c.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY,
        reasonForApplying TEXT,
        familyName TEXT, 
        givenName TEXT, 
        middleName TEXT,
        familyName2a TEXT,
        givenName2b TEXT,
        middleName2c TEXT,
        familyName3a TEXT,
        givenName3b TEXT,
        middleName3c TEXT,
        familyName4a TEXT,
        givenName4b TEXT,
        middleName4c TEXT,
        alienRegistrationNumber TEXT,
        uscisOnlineAccountNumber TEXT,
        gender TEXT,
        maritalStatus TEXT,
        filedI765 TEXT,
        ssaCardIssued TEXT,
        ssn TEXT,
        wantsSsaCard TEXT,
        consentForDisclosure TEXT,
        fatherFamilyName TEXT,
        fatherGivenName TEXT,
        motherFamilyName TEXT,
        motherGivenName TEXT
        )
    ''')
    # mailing_addresses table
    c.execute('''
    CREATE TABLE IF NOT EXISTS mailing_addresses (
        id INTEGER PRIMARY KEY,
        application_id INTEGER,
        inCareOf TEXT,
        street TEXT,
        addressType TEXT,  -- 'mailingApt', 'mailingSte', or 'mailingFlr'
        unit TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        isSameAsPhysical TEXT,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
        )
    ''')
    # physical_addresses table
    c.execute('''
    CREATE TABLE IF NOT EXISTS physical_addresses (
        id INTEGER PRIMARY KEY,
        application_id INTEGER,
        street TEXT,
        addressType TEXT,  -- 'physicalApt', 'physicalSte', or 'physicalFlr'
        unit TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
        )
    ''')

    c.close()
    conn.commit()
    conn.close()
    

@app.route('/clear-table')
def clear_table():
    table_name = "applications"
    try:
        conn = sqlite3.connect('database.db')
        cur = conn.cursor()
        # clear all data from the table
        cur.execute(f"DELETE FROM {table_name}")
        cur.close()
        conn.commit()
        conn.close()
        
        return f"All data from {table_name} has been cleared.", 200
    except Exception as e:
        return f"An error occurred: {e}", 500


@app.route('/submit-application', methods=['POST'])
def submit_application():
    data = request.json
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    
    # Insert into the applications table
    application_fields = ['reasonForApplying', 'familyName', 'givenName', 'middleName', 
                          'familyName2a', 'givenName2b', 'middleName2c', 
                          'familyName3a', 'givenName3b', 'middleName3c', 
                          'familyName4a', 'givenName4b', 'middleName4c',
                          'alienRegistrationNumber', 'uscisOnlineAccountNumber', 
                          'gender', 'maritalStatus', 'filedI765', 'ssaCardIssued', 
                          'ssn', 'wantsSsaCard', 'consentForDisclosure',
                          'fatherFamilyName', 'fatherGivenName', 
                          'motherFamilyName', 'motherGivenName']
    application_values = tuple(data[field] for field in application_fields)
    c.execute('''
        INSERT INTO applications (reasonForApplying, familyName, givenName, middleName, 
                                  familyName2a, givenName2b, middleName2c, familyName3a, givenName3b, middleName3c, 
                                  familyName4a, givenName4b, middleName4c,
                                  alienRegistrationNumber, uscisOnlineAccountNumber, 
                                  gender, maritalStatus, filedI765, ssaCardIssued, 
                                  ssn, wantsSsaCard, consentForDisclosure,
                                  fatherFamilyName, fatherGivenName, 
                                  motherFamilyName, motherGivenName) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', application_values)

    application_id = c.lastrowid  # Retrieve the ID of the newly inserted application
    

    # Insert into the mailing_addresses table
    mailing_address_fields = ['inCareOf', 'street', 'addressType', 'unit', 'city', 'state', 'zip', 'isSameAsPhysical']
    mailing_address_values = tuple(data['mailing'+ field[0].upper() + field[1:]] for field in mailing_address_fields)
    c.execute('''
        INSERT INTO mailing_addresses (application_id, inCareOf, street, addressType, unit, city, state, zip, isSameAsPhysical)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (application_id, *mailing_address_values))
    

    # Insert into the physical_addresses table if necessary
    if data.get('mailingIsSameAsPhysical') != 'Yes':  # Check if physical address is different
        physical_address_fields = ['street', 'addressType', 'unit', 'city', 'state', 'zip']
        physical_address_values = tuple(data['physical'+ field[0].upper() + field[1:]] for field in physical_address_fields)
        c.execute('''
            INSERT INTO physical_addresses (application_id, street, addressType, unit, city, state, zip)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (application_id, *physical_address_values))

    c.close()
    conn.commit()
    conn.close()
    
    
    response = jsonify({"success": True})
    return response

@app.route('/retrieve-application', methods=['GET'])
def retrieve_application():
    input_id = request.args.get('inputId')  # Retrieve the 'inputId' from the query parameters
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    c.execute("SELECT * FROM applications WHERE id=?", (input_id,))
    application_row = c.fetchone()
    application_columns = [description[0] for description in c.description]
    
    if application_row:
        application_data = dict(zip(application_columns, application_row))

        # Fetch mailing address data
        c.execute("SELECT * FROM mailing_addresses WHERE application_id=?", (input_id,))
        mailing_row = c.fetchone()
        mailing_data = {}
        if mailing_row:
            mailing_columns = [description[0] for description in c.description]
            # Exclude the application_id from the address data if not needed
            new_mailing_columns = ['mailing'+ value[0].upper() + value[1:] for value in mailing_columns]
            mailing_data = dict(zip(new_mailing_columns, mailing_row))
            print(mailing_data)
            mailing_data.pop('application_id', None)

        # Fetch physical address data
        c.execute("SELECT * FROM physical_addresses WHERE application_id=?", (input_id,))
        physical_row = c.fetchone()
        physical_data = {}
        if physical_row:
            physical_columns = [description[0] for description in c.description]
            new_physical_columns = ['physical'+ value[0].upper() + value[1:] for value in physical_columns]
            # Exclude the application_id from the address data if not needed
            physical_data = dict(zip(new_physical_columns, physical_row))
            
            physical_data.pop('application_id', None)

        c.close()
        conn.close()

        # Merge data from all sources
        combined_data = {**application_data, **mailing_data, **physical_data}
        

        return jsonify(combined_data), 200
    else:
        c.close()
        conn.close()
        return jsonify({"error": "Application not found"}), 404

@app.route('/get-max-id', methods=['GET'])
def get_max_id():
    try:
        conn = sqlite3.connect('database.db')
        c = conn.cursor()    
        # Execute the query to find the maximum ID in the applications table
        c.execute("SELECT MAX(id) FROM applications")
        max_id = c.fetchone()[0]  # Fetch the first (and only) row, and get the first column
        c.close()
        conn.close()
        if max_id is None:
            max_id = 0
        # Return the max_id in a JSON response
        return jsonify({"max_id": max_id}), 200
    except Exception as e:
        # In case of any error, return an error message
        return jsonify({"error": str(e)}), 500

formTextDict = {
    'form1[0].Page1[0].Line1a_FamilyName[0]': "familyName",
    'form1[0].Page1[0].Line1b_GivenName[0]': "givenName",
    'form1[0].Page1[0].Line1c_MiddleName[0]': "middleName",
    'form1[0].Page1[0].Line2a_FamilyName[0]': "familyName2a",
    'form1[0].Page1[0].Line2b_GivenName[0]': "givenName2b",
    'form1[0].Page1[0].Line2c_MiddleName[0]': "middleName2c",

    'form1[0].Page1[0].Line3a_FamilyName[1]': "familyName3a",
    'form1[0].Page1[0].Line3b_GivenName[1]': "givenName3b",
    'form1[0].Page1[0].Line3c_MiddleName[1]': "middleName3c",

    'form1[0].Page1[0].Line3a_FamilyName[0]': "familyName4a",
    'form1[0].Page1[0].Line3b_GivenName[0]': "givenName4b",
    'form1[0].Page1[0].Line3c_MiddleName[0]': "middleName4c",

    'form1[0].Page2[0].Line4a_InCareofName[0]': "mailingInCareOf",
    'form1[0].Page2[0].Line4b_StreetNumberName[0]': "mailingStreet",
    'form1[0].Page2[0].Pt2Line5_AptSteFlrNumber[0]': "mailingUnit",
    'form1[0].Page2[0].Pt2Line5_CityOrTown[0]': "mailingCity",
    'form1[0].Page2[0].Pt2Line5_State[0]': "mailingState",
    'form1[0].Page2[0].Pt2Line5_ZipCode[0]': "mailingZip",
    
    'form1[0].Page2[0].Pt2Line7_StreetNumberName[0]': "physicalStreet",
    'form1[0].Page2[0].Pt2Line7_AptSteFlrNumber[0]': "physicalUnit",
    'form1[0].Page2[0].Pt2Line7_CityOrTown[0]': "physicalCity",
    'form1[0].Page2[0].Pt2Line7_State[0]': "physicalState",
    'form1[0].Page2[0].Pt2Line7_ZipCode[0]': "physicalZip",
    'form1[0].Page2[0].Line7_AlienNumber[0]': "alienRegistrationNumber",
    'form1[0].Page2[0].Line8_ElisAccountNumber[0]': "uscisOnlineAccountNumber",

    'form1[0].Page2[0].Line12b_SSN[0]': "ssn",
    
    'form1[0].Page2[0].Line15a_FamilyName[0]': "fatherFamilyName",
    'form1[0].Page2[0].Line15b_GivenName[0]': "fatherGivenName",
    'form1[0].Page2[0].Line16a_FamilyName[0]': "motherFamilyName",
    'form1[0].Page2[0].Line16b_GivenName[0]': "motherGivenName"
}

# dont forget combo Box
formCheckBoxDict = {
    'form1[0].Page1[0].Part1_Checkbox[0]': ("reasonForApplying", 'initialPermission'),
    'form1[0].Page1[0].Part1_Checkbox[1]': ("reasonForApplying", 'replacement'),
    'form1[0].Page1[0].Part1_Checkbox[2]': ("reasonForApplying", 'renewal'),

    'form1[0].Page2[0].Part2Line5_Checkbox[1]': ("mailingIsSameAsPhysical", "Yes"),
    'form1[0].Page2[0].Part2Line5_Checkbox[0]': ("mailingIsSameAsPhysical", "No"),


    'form1[0].Page2[0].Line9_Checkbox[1]': ("gender", "Male"),
    'form1[0].Page2[0].Line9_Checkbox[0]': ("gender", "Female"),
    'form1[0].Page2[0].Line10_Checkbox[2]': ("maritalStatus", "Single"),
    'form1[0].Page2[0].Line10_Checkbox[3]': ("maritalStatus", "Married"),
    'form1[0].Page2[0].Line10_Checkbox[1]': ("maritalStatus", "Divorced"),
    'form1[0].Page2[0].Line10_Checkbox[0]': ("maritalStatus", "Widowed"),
    'form1[0].Page2[0].Line19_Checkbox[1]': ("filedI765", "Yes"),
    'form1[0].Page2[0].Line19_Checkbox[0]': ("filedI765", "No"),

    'form1[0].Page2[0].Line12a_Checkbox[1]': ("ssaCardIssued", "Yes"),
    'form1[0].Page2[0].Line12a_Checkbox[0]': ("ssaCardIssued", "No"),

    'form1[0].Page2[0].Pt2Line5_Unit[2]': ("mailingAddressType", "mailingApt"),
    'form1[0].Page2[0].Pt2Line5_Unit[0]': ("mailingAddressType", "mailingSte"),
    'form1[0].Page2[0].Pt2Line5_Unit[1]': ("mailingAddressType", "mailingFlr"),

    'form1[0].Page2[0].Pt2Line7_Unit[2]': ("physicalAddressType", "physicalApt"),
    'form1[0].Page2[0].Pt2Line7_Unit[0]': ("physicalAddressType", "physicalSte"),
    'form1[0].Page2[0].Pt2Line7_Unit[1]': ("physicalAddressType", "physicalFlr"),

    'form1[0].Page2[0].Line14_Checkbox_No[0]': ("consentForDisclosure", "No"),
    'form1[0].Page2[0].Line14_Checkbox_Yes[0]': ("consentForDisclosure", "Yes"),

    'form1[0].Page2[0].Line13_Checkbox[0]': ("wantsSSACard", "No"),
    'form1[0].Page2[0].Line13_Checkbox[1]': ("wantsSSACard", "Yes"),
}

formComboBoxDict = {
    'form1[0].Page2[0].Pt2Line5_State[0]': "mailingState",
    'form1[0].Page2[0].Pt2Line7_State[0]': "physicalState",
}

# Route to list PDF form field names
@app.route('/list-pdf-fields/<pdf_name>', methods=['GET'])
def list_pdf_form_field_names(pdf_name):
    pdf_path = os.path.join('path_to_pdf_folder', pdf_name)
    doc = fitz.open(pdf_path)
    fields = []
    for page in doc:
        for field in page.widgets():
            fields.append({"field_name": field.field_name, "field_type": field.field_type_string})
    doc.close()
    return jsonify(fields)

# Route to fill a PDF form and return it
@app.route('/fill-pdf', methods=['POST'])
def fill_pdf_form():
    data = request.json
    print(data)
    pdf_path = 'i-765.pdf'  # Path to PDF template

    doc = fitz.open(pdf_path)

    # Flatten the structured data for easier mapping, if necessary
    # assumes direct mapping for simplicity
    for page in doc:
        for field in page.widgets():
            # for text fields
            if field.field_name in formTextDict and formTextDict[field.field_name] in data:
                field.field_value = str(data[formTextDict[field.field_name]])
                field.update()
            #for checkbox fields
            elif field.field_name in formCheckBoxDict and formCheckBoxDict[field.field_name][0] in data:
                if data[formCheckBoxDict[field.field_name][0]] == formCheckBoxDict[field.field_name][1]:
                    field.field_value = "Yes"
                    field.update()
            elif field.field_name in formComboBoxDict and formComboBoxDict[field.field_name] in data:
                field.set_field_value(str(data[formComboBoxDict[field.field_name]]))
                field.update()
    
    # Instead of saving the PDF to a file, save it to a bytes buffer
    pdf_bytes = io.BytesIO()
    doc.save(pdf_bytes)
    doc.close()
    pdf_bytes.seek(0)  # Move to the beginning of the BytesIO buffer

    return Response(pdf_bytes, mimetype='application/pdf',
                    headers={'Content-Disposition': 'inline; filename=filled-i-765.pdf'})

if __name__ == '__main__':
    #with app.app_context():
    #    db.create_all()
    #db_column_inspection()
    init_db()
    #clear_table()
    app.run(debug=True)
