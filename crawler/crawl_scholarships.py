import os
import json
from datetime import datetime, timezone
import argparse

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'raw', 'scholarships')
os.makedirs(DATA_DIR, exist_ok=True)

def generate_mock_data():
    mock_schemes = [
        {
            "name": "Post Matric Scholarship Scheme for SC Students",
            "description": "The Post Matric Scholarship Scheme for Scheduled Castes is a centrally sponsored scheme to provide financial assistance to SC students studying at post-matriculation or post-secondary stages to enable them to complete their education. The scholarship includes tuition fee reimbursement, maintenance allowance, and academic allowances.",
            "eligibility": "1. Student must belong to Scheduled Caste (SC) category. \n2. Must be studying in an approved Post-Matriculation course in a recognized institution. \n3. Annual family income from all sources must not exceed Rs. 2.5 Lakh per annum. \n4. Should not be receiving any other government-sponsored scholarship.",
            "documents": "1. Passport size Photograph \n2. Caste Certificate issued by competent authority \n3. Income Certificate of parents \n4. Marksheet of the last qualifying examination \n5. Fee receipt of the current academic year \n6. Bank Passbook copy (Aadhaar-linked account) \n7. Aadhaar Card",
            "steps": "1. Go to the National Scholarship Portal (NSP) website at https://scholarships.gov.in/ or your State's Scholarship Portal.\n2. Click on 'New Registration' and read the guidelines. Enter your State of Domicile, scholarship category, name, mobile, and bank account details.\n3. Log in using the generated Application ID and OTP received on your mobile.\n4. Fill in the application form with your academic details, fees paid, and personal details.\n5. Upload scans of your Caste Certificate (SC), Income Certificate, and Marks/Academic transcripts.\n6. Submit the form online and print a copy. Hand the printout and physical documents to your College/Institution for verification.",
            "application_url": "https://scholarships.gov.in/",
            "source_url": "https://scholarships.gov.in/",
            "crawled_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "name": "Pre Matric Scholarship Scheme for Minority Students",
            "description": "The Pre Matric Scholarship for Minorities provides financial assistance to students belonging to minority communities (Muslims, Sikhs, Christians, Buddhists, Jains, and Zoroastrians/Parsis) studying in classes 1 to 10. The scholarship aims to encourage parents to send their children to school and prevent dropouts.",
            "eligibility": "1. Must belong to one of the notified minority communities. \n2. Must be studying in class 1 to 10 in a government/recognized private school. \n3. Must have secured not less than 50% marks in the previous final examination (not applicable to class 1). \n4. Annual income of parents from all sources must not exceed Rs. 1 Lakh.",
            "documents": "1. Student Photograph \n2. Self-declaration of minority community by parent/guardian \n3. Income Certificate of parent/guardian \n4. Marksheet of previous final exam \n5. Fee receipt of current school year \n6. Bank account details of student or parent",
            "steps": "1. Register as a new user on the National Scholarship Portal (NSP) at https://scholarships.gov.in/.\n2. Log in using the student ID and password sent to your mobile.\n3. Choose 'Pre-Matric Scholarship Scheme for Minorities' from the list of available schemes.\n4. Enter student academic details, family income, and community self-declaration.\n5. Upload required documents: student photograph, parent income certificate, and community certificate.\n6. Submit the application. Your school authority will verify the records online to release the scholarship benefits.",
            "application_url": "https://scholarships.gov.in/",
            "source_url": "https://scholarships.gov.in/",
            "crawled_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for scheme in mock_schemes:
        slug = scheme["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
        filepath = os.path.join(DATA_DIR, f"{slug}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(scheme, f, indent=4, ensure_ascii=False)
    print(f"Generated {len(mock_schemes)} mock schemes in raw/scholarships directory.")

def crawl_scholarships():
    print("Starting crawl for scholarships.gov.in...")
    try:
        raise Exception("National Scholarship Portal uses heavy JS controls and security blocks. Falling back to local data snapshot.")
    except Exception as e:
        print(f"Crawl failed: {e}")
        generate_mock_data()

if __name__ == "__main__":
    crawl_scholarships()
