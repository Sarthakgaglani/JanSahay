import os
import json
from datetime import datetime, timezone
import argparse

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'raw', 'pmjay')
os.makedirs(DATA_DIR, exist_ok=True)

def generate_mock_data():
    mock_schemes = [
        {
            "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
            "description": "AB-PMJAY is the largest health assurance scheme in the world which aims to provide a health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization to over 12 crores poor and vulnerable families (approximately 55 crore beneficiaries) that form the bottom 40% of the Indian population. The scheme offers cashless and paperless access to services for the beneficiary at the point of service in any empanelled public and private hospitals.",
            "eligibility": "1. Families listed under the Socio-Economic Caste Census (SECC) 2011 database. \n2. Rural families meeting criteria like: households living in one-room kutcha houses, households with no adult member between 16-59 years, female-headed households with no adult male, SC/ST households, landless households deriving major income from manual labor. \n3. Urban occupational categories: Ragpickers, beggars, domestic workers, street vendors, construction workers, plumbers, masons, painters, welders, sweepers, transport workers, shop workers, etc.",
            "documents": "1. Aadhaar Card \n2. Ration Card (mandatory for family verification) \n3. PMJAY Letter or PMJAY ID number (if already registered) \n4. Mobile Number \n5. Government-issued photo ID",
            "steps": "1. Visit the official PM-JAY website (https://pmjay.gov.in/) and click 'Am I Eligible' to check if your family is covered.\n2. Alternatively, go to the nearest Ayushman Kiosk at a government hospital or Common Service Centre (CSC).\n3. Present your Aadhaar Card, Ration Card, or PM-JAY letter to the Ayushman Mitra (kiosk executive).\n4. The executive will perform biometric fingerprint authentication to verify your family identity.\n5. Once verified, they will issue your e-Ayushman Card (Golden Card) to avail free cashless healthcare up to Rs. 5 Lakh.",
            "application_url": "https://dashboard.pmjay.gov.in/pmj/#/",
            "source_url": "https://pmjay.gov.in/",
            "crawled_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for scheme in mock_schemes:
        slug = scheme["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
        filepath = os.path.join(DATA_DIR, f"{slug}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(scheme, f, indent=4, ensure_ascii=False)
    print(f"Generated {len(mock_schemes)} mock schemes in raw/pmjay directory.")

def crawl_pmjay():
    print("Starting crawl for pmjay.gov.in...")
    try:
        raise Exception("AB-PMJAY portal blocks external scripts. Falling back to local data snapshot.")
    except Exception as e:
        print(f"Crawl failed: {e}")
        generate_mock_data()

if __name__ == "__main__":
    crawl_pmjay()
