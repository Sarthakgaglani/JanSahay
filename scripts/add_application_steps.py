import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')

STEPS_MAP = {
    "eshram-card-registration": (
        "1. Visit the official eSHRAM self-registration portal at https://register.eshram.gov.in/.\n"
        "2. Enter your Aadhaar-linked active mobile number and the captcha code, then click 'Send OTP'.\n"
        "3. Enter the OTP received on your mobile device to verify your identity.\n"
        "4. Enter your Aadhaar card number, accept the terms and conditions, and click 'Submit'. Another OTP will be sent to your Aadhaar-registered mobile.\n"
        "5. Enter the Aadhaar OTP to load your personal details automatically.\n"
        "6. Fill in the remaining sections: personal details, residential address, education qualifications, monthly income, and occupation details.\n"
        "7. Provide your bank account details (Account Number, IFSC, Holder Name) for Direct Benefit Transfers.\n"
        "8. Review the self-declaration summary page. Click 'Submit' to generate your 12-digit UAN eSHRAM Card and download it."
    ),
    "pradhan-mantri-kisan-samman-nidhi-pm-kisan": (
        "1. Go to the official PM-KISAN portal (https://pmkisan.gov.in/) and click on 'New Farmer Registration' under the Farmers Corner.\n"
        "2. Select 'Rural Farmer Registration' or 'Urban Farmer Registration', enter your Aadhaar number, mobile number, select your state, and click 'Get OTP'.\n"
        "3. Enter the received OTP and verify your identity.\n"
        "4. Fill in the detailed registration form: select your District, Sub-district, Block, and Village.\n"
        "5. Input your personal info (name, gender, category, bank account details, land registration ID).\n"
        "6. Upload your land ownership documents (Khatauni/Jamabandi) and self-declaration.\n"
        "7. Click 'Save' to submit your application. The local administration (Patwari/District Officer) will verify your land details before starting payouts."
    ),
    "pradhan-mantri-awas-yojana-gramin": (
        "1. Since registration is done locally based on SECC 2011 data, contact your local Gram Panchayat or Ward Office.\n"
        "2. Alternatively, visit the PMAY-G portal (https://pmayg.nic.in/) to check if your name is in the beneficiary list.\n"
        "3. Provide your Aadhaar card, bank account, and MGNREGA Job Card details to the Panchayat Officer.\n"
        "4. The officer will register your details on the 'AwaasSoft' portal and capture a geo-tagged photograph of your current kutcha house.\n"
        "5. Once approved, the funds will be transferred directly to your bank account in multiple installments to construct the house."
    ),
    "pradhan-mantri-mudra-yojana-pmmy": (
        "1. Download the Mudra loan application form (Shishu, Kishore, or Tarun) from the official Mudra website or get it from your local bank branch.\n"
        "2. Fill in the business plan details, capital requirements, and personal identification info.\n"
        "3. Attach the required documents (ID proof, address proof, business license, and vendor quotations for equipment).\n"
        "4. Submit the completed application form to a participating bank, RRB, NBFC, or Microfinance Institution.\n"
        "5. The bank will review your credit history and business viability. Once approved, the loan amount will be disbursed."
    ),
    "atal-pension-yojana-apy": (
        "1. Visit the nearest participating bank branch where you hold a savings account, or log in to your bank's Net Banking / Mobile Banking portal.\n"
        "2. Request the APY registration form or select the 'Atal Pension Yojana' option online.\n"
        "3. Enter your savings bank account number and primary Aadhaar card KYC details.\n"
        "4. Choose your desired monthly pension amount (from Rs. 1,000 to Rs. 5,000).\n"
        "5. Fill in the nominee information and authorization details.\n"
        "6. Select auto-debit consent so premium contributions are deducted periodically from your bank account."
    ),
    "pradhan-mantri-suraksha-bima-yojana-pmsby": (
        "1. Contact the bank or post office where your savings bank account is maintained.\n"
        "2. Request the PMSBY application cum auto-debit consent form, or log in to your Net Banking portal.\n"
        "3. Fill in your name, Aadhaar card number, nominee details, and select your savings account.\n"
        "4. Tick the auto-debit consent box to allow the annual premium deduction of Rs. 20.\n"
        "5. Submit the form online or hand it to the bank teller to activate your accidental insurance coverage."
    ),
    "pradhan-mantri-jeevan-jyoti-bima-yojana-pmjjby": (
        "1. Go to the bank branch or post office holding your active savings account, or log in to their Net Banking interface.\n"
        "2. Search for the PMJJBY enrollment section or ask for the physical enrollment form.\n"
        "3. Provide your Aadhaar number, nominee details, and self-attested health declaration.\n"
        "4. Authorize the bank to auto-debit the annual premium of Rs. 436 from your account.\n"
        "5. Submit the form to activate your life insurance coverage (note: a 30-day lien period applies for non-accidental claims)."
    ),
    "ayushman-bharat-pradhan-mantri-jan-arogya-yojana-ab-pmjay": (
        "1. Visit the official PM-JAY website (https://pmjay.gov.in/) and click 'Am I Eligible' to check if your family is covered.\n"
        "2. Alternatively, go to the nearest Ayushman Kiosk at a government hospital or Common Service Centre (CSC).\n"
        "3. Present your Aadhaar Card, Ration Card, or PM-JAY letter to the Ayushman Mitra (kiosk executive).\n"
        "4. The executive will perform biometric fingerprint authentication to verify your family identity.\n"
        "5. Once verified, they will issue your e-Ayushman Card (Golden Card) to avail free cashless healthcare up to Rs. 5 Lakh."
    ),
    "post-matric-scholarship-scheme-for-sc-students": (
        "1. Go to the National Scholarship Portal (NSP) website at https://scholarships.gov.in/ or your State's Scholarship Portal.\n"
        "2. Click on 'New Registration' and read the guidelines. Enter your State of Domicile, scholarship category, name, mobile, and bank account details.\n"
        "3. Log in using the generated Application ID and OTP received on your mobile.\n"
        "4. Fill in the application form with your academic details, fees paid, and personal details.\n"
        "5. Upload scans of your Caste Certificate (SC), Income Certificate, and Marks/Academic transcripts.\n"
        "6. Submit the form online and print a copy. Hand the printout and physical documents to your College/Institution for verification."
    ),
    "pre-matric-scholarship-scheme-for-minority-students": (
        "1. Register as a new user on the National Scholarship Portal (NSP) at https://scholarships.gov.in/.\n"
        "2. Log in using the student ID and password sent to your mobile.\n"
        "3. Choose 'Pre-Matric Scholarship Scheme for Minorities' from the list of available schemes.\n"
        "4. Enter student academic details, family income, and community self-declaration.\n"
        "5. Upload required documents: student photograph, parent income certificate, and community certificate.\n"
        "6. Submit the application. Your school authority will verify the records online to release the scholarship benefits."
    ),
    "pradhan-mantri-jan-dhan-yojana-pmjdy": (
        "1. Visit any commercial bank branch, regional rural bank, or authorized Bank Mitra (Business Correspondent).\n"
        "2. Obtain the PMJDY account opening form (available in English, Hindi, and regional languages).\n"
        "3. Fill in your personal details, nominee details, and address.\n"
        "4. Submit the completed form along with your Aadhaar Card (or other OVDs like Voter ID/PAN Card) for instant KYC.\n"
        "5. The bank will open your zero-balance account and issue a free RuPay Debit Card with built-in Rs. 2 Lakh accident insurance."
    )
}

def migrate_raw_json():
    print("Migrating raw JSON schemas to include steps...")
    migrated_count = 0
    for portal in os.listdir(RAW_DIR):
        portal_path = os.path.join(RAW_DIR, portal)
        if not os.path.isdir(portal_path):
            continue
        for filename in os.listdir(portal_path):
            if not filename.endswith('.json') or filename == '.gitkeep':
                continue
            filepath = os.path.join(portal_path, filename)
            slug = filename[:-5]
            if slug in STEPS_MAP:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                data["steps"] = STEPS_MAP[slug]
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                migrated_count += 1
    print(f"Successfully migrated {migrated_count} raw JSON files.")

if __name__ == "__main__":
    migrate_raw_json()
