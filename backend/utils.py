import fitz

#def sqlalchemy():

#from sqlalchemy import inspect

#from flask_sqlalchemy import SQLAlchemy
#import psycopg2.extras
    
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://db_765db_user:Mact4uUzEHztL5epfeV8MsWeOQdBXly6@dpg-cnj7nkol5elc73fs0bt0-a.oregon-postgres.render.com/db_765db'
#'postgresql://postgres:wodelu.,@localhost:5432/i765DB'
#db = SQLAlchemy(app)


# DB_HOST = "your_host"
# DB_NAME = "your_db_name"
# DB_USER = "your_db_user"
# DB_PASS = "your_db_password"
# conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST)



    #for value in values:
    #    print(type(value))
    # for key in data:

    #     value_to_insert = data[key]  # This is the value you want to insert
    #     column_name = key

    #     if key!="id" and value_to_insert.strip():  # Checks if the value is not empty or just whitespace
    #         insert_query = f"INSERT INTO applications ({column_name}) VALUES (?)"
    #         print(value_to_insert)
    #         c.execute(insert_query,(value_to_insert,))
    #         # Execute the insert_query with the value_to_insert using your database connection
    #     elif key=='id':
    #         insert_query = f"INSERT INTO applications ({column_name}) VALUES (?)"
    #         print(key)
    #         print(value_to_insert)
    #         c.execute(insert_query,((value_to_insert,)))
    #     else:
    #         print("The input value is empty, not inserting.")

def db_column_inspection():
    with app.app_context():
        inspector = inspect(db.engine)
        columns = inspector.get_columns('applications')
        for column in columns:
            print(column['name'])

def camel_to_snake(camel_str):
    return ''.join(['_' + char.lower() if char.isupper() else char for char in camel_str])

def list_pdf_form_field_names(pdf_path):
    doc = fitz.open(pdf_path)
    for page in doc:
        for field in page.widgets():
            print(f"Field Name: {field.field_name}, Field Type: {field.field_type_string}")
    doc.close()

applicant_info = {
    "reasonForApplying": "Example reason",
    "fullName": {
        "familyName": "Doe",
        "givenName": "John",
        "middleName": "A"
    },
    # Assume additional fields follow a similar structure
    "mailingStreet": "123 Example St",
    "mailingCity": "Example City",
    # ...more fields as in your structure
    "ssn": "123-45-6789"
}

list_pdf_form_field_names("../../i-765.pdf")

def fill_pdf_form(pdf_path, output_pdf_path, applicant_info):
    doc = fitz.open(pdf_path)
    
    # Flatten the structured data for easier mapping, if necessary
    # For example, handling 'fullName' to map 'familyName', 'givenName', etc.
    # This step depends on how your PDF fields are named and structured
    
    # Example of setting a text field value
    for page in doc:
        for field in page.widgets():
            if field.field_name == "form1[0].Page1[0].Line1a_FamilyName[0]":  # Replace with actual PDF field name
                #print(applicant_info["fullName"]["familyName"])
                field.field_value = applicant_info["fullName"]["familyName"]
                field.update()
                #doc.update_field(field, field_value)
                #field.set_text(applicant_info["fullname"]["familyName"])
            # Add conditions for other fields based on their field names and your data structure
            
    doc.save(output_pdf_path)
    doc.close()

#fill_pdf_form("../../i-765.pdf", "../../filled_i-765.pdf", applicant_info)
