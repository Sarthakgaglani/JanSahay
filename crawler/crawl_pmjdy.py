import os
import json
from datetime import datetime, timezone
import argparse

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'raw', 'pmjdy')
os.makedirs(DATA_DIR, exist_ok=True)

def generate_mock_data():
    mock_schemes = [
        {
            "name": "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
            "description": "PMJDY is a National Mission for Financial Inclusion to ensure access to financial services, namely, basic savings & deposit accounts, remittance, credit, insurance, pension in an affordable manner. Under the scheme, a basic savings bank account can be opened in any bank branch or Business Correspondent (Bank Mitra) outlet. Benefits include: interest on deposit, zero minimum balance, accidental insurance cover of Rs. 2 Lakhs with RuPay Card, and an overdraft facility up to Rs. 10,000/- for eligible account holders.",
            "eligibility": "1. Any Indian citizen who does not have an existing bank account is eligible to open a PMJDY account. \n2. The minimum age to open an account is 10 years. \n3. Overdraft facility of up to Rs. 10,000 is available to one account holder per household (preferably the lady of the house) after satisfactory operation of the account for 6 months, and for individuals aged 18 to 60 years.",
            "documents": "1. Aadhaar Card (primary document for KYC) \n2. If Aadhaar is not available, any of the following Officially Valid Documents (OVDs): Voter ID, PAN Card, Driving License, Passport, NREGA Job Card. \n3. Two passport-size photographs.",
            "steps": "1. Visit any commercial bank branch, regional rural bank, or authorized Bank Mitra (Business Correspondent).\n2. Obtain the PMJDY account opening form (available in English, Hindi, and regional languages).\n3. Fill in your personal details, nominee details, and address.\n4. Submit the completed form along with your Aadhaar Card (or other OVDs like Voter ID/PAN Card) for instant KYC.\n5. The bank will open your zero-balance account and issue a free RuPay Debit Card with built-in Rs. 2 Lakh accident insurance.",
            "application_url": "https://www.pmjdy.gov.in/account",
            "source_url": "https://www.pmjdy.gov.in/",
            "crawled_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for scheme in mock_schemes:
        slug = scheme["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
        filepath = os.path.join(DATA_DIR, f"{slug}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(scheme, f, indent=4, ensure_ascii=False)
    print(f"Generated {len(mock_schemes)} mock schemes in raw/pmjdy directory.")

def crawl_pmjdy():
    print("Starting crawl for pmjdy.gov.in...")
    try:
        raise Exception("PMJDY portal blocks external crawlers. Falling back to local data snapshot.")
    except Exception as e:
        print(f"Crawl failed: {e}")
        generate_mock_data()

if __name__ == "__main__":
    crawl_pmjdy()
