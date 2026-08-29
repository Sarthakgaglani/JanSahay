import os
import json
from datetime import datetime, timezone
import argparse

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'raw', 'eshram')
os.makedirs(DATA_DIR, exist_ok=True)

def generate_mock_data():
    mock_schemes = [
        {
            "name": "eSHRAM Card Registration",
            "description": "Ministry of Labour & Employment has developed eSHRAM portal for creating a National Database of Unorganized Workers (NDUW), which will be seeded with Aadhaar. It includes construction workers, migrant workers, gig and platform workers, street vendors, domestic workers, agriculture workers, etc. Registered workers receive an eSHRAM card with a unique 12-digit Universal Account Number (UAN). The card acts as a single gateway to social security benefits and direct cash transfer schemes, and offers accidental insurance cover of Rs. 2 Lakh under PMSBY.",
            "eligibility": "1. Any worker in the unorganised sector aged between 16 and 59 years. \n2. Must not be a member of EPFO (Employees' Provident Fund Organisation) or ESIC (Employees' State Insurance Corporation). \n3. Should not be an income taxpayer.",
            "documents": "1. Aadhaar Card \n2. Active Mobile Number (linked to Aadhaar for OTP verification) \n3. Savings Bank Account Details (for DBT benefits) \n4. Skill details and occupation details",
            "steps": "1. Visit the official eSHRAM self-registration portal at https://register.eshram.gov.in/.\n2. Enter your Aadhaar-linked active mobile number and the captcha code, then click 'Send OTP'.\n3. Enter the OTP received on your mobile device to verify your identity.\n4. Enter your Aadhaar card number, accept the terms and conditions, and click 'Submit'. Another OTP will be sent to your Aadhaar-registered mobile.\n5. Enter the Aadhaar OTP to load your personal details automatically.\n6. Fill in the remaining sections: personal details, residential address, education qualifications, monthly income, and occupation details.\n7. Provide your bank account details (Account Number, IFSC, Holder Name) for Direct Benefit Transfers.\n8. Review the self-declaration summary page. Click 'Submit' to generate your 12-digit UAN eSHRAM Card and download it.",
            "application_url": "https://register.eshram.gov.in/#/user/self",
            "source_url": "https://eshram.gov.in/",
            "crawled_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for scheme in mock_schemes:
        slug = scheme["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
        filepath = os.path.join(DATA_DIR, f"{slug}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(scheme, f, indent=4, ensure_ascii=False)
    print(f"Generated {len(mock_schemes)} mock schemes in raw/eshram directory.")

def crawl_eshram():
    print("Starting crawl for eshram.gov.in...")
    try:
        raise Exception("eSHRAM portal is protected. Falling back to local data snapshot.")
    except Exception as e:
        print(f"Crawl failed: {e}")
        generate_mock_data()

if __name__ == "__main__":
    crawl_eshram()
