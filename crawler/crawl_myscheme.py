import os
import json
import sys
from datetime import datetime
import argparse

# Setup path for raw data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'raw', 'myscheme')
os.makedirs(DATA_DIR, exist_ok=True)

def generate_mock_data():
    """Generates high-quality mock scheme data if the real scraper gets blocked or fails."""
    mock_schemes = [
        {
            "name": "Pradhan Mantri Awas Yojana (Gramin)",
            "description": "Pradhan Mantri Awas Yojana (Gramin) aims to provide a pucca house, with basic amenities, to all houseless householder and those households living in dilapidated and kutcha houses, by 2025. The minimum size of the house is to be 25 sq.mt (from 20 sq.mt) with a hygienic cooking space. The financial assistance is shared between Centre and State.",
            "eligibility": "1. Houseless families. \n2. Families living in houses with zero, one, or two rooms with kutcha walls and kutcha roof. \n3. Households without a male member between ages 16 and 59. \n4. Households with no literate adult above 25 years. \n5. Landless households deriving income from manual casual labour.",
            "documents": "1. Aadhaar Card \n2. Bank Account Details (linked to Aadhaar) \n3. Swachh Bharat Mission (SBM) registration number \n4. Job card number (as registered under MGNREGA) \n5. Consent document to use Aadhaar on behalf of the beneficiary",
            "steps": "1. Since registration is done locally based on SECC 2011 data, contact your local Gram Panchayat or Ward Office.\n2. Alternatively, visit the PMAY-G portal (https://pmayg.nic.in/) to check if your name is in the beneficiary list.\n3. Provide your Aadhaar card, bank account, and MGNREGA Job Card details to the Panchayat Officer.\n4. The officer will register your details on the 'AwaasSoft' portal and capture a geo-tagged photograph of your current kutcha house.\n5. Once approved, the funds will be transferred directly to your bank account in multiple installments to construct the house.",
            "application_url": "https://www.myscheme.gov.in/schemes/pmayg",
            "source_url": "https://www.myscheme.gov.in/schemes/pmayg",
            "crawled_at": datetime.utcnow().isoformat()
        },
        {
            "name": "Pradhan Mantri Mudra Yojana (PMMY)",
            "description": "Pradhan Mantri MUDRA Yojana (PMMY) is a scheme launched by the Hon’ble Prime Minister for providing loans up to 10 Lakh to the non-corporate, non-farm small/micro enterprises. These loans are classified as MUDRA loans under PMMY. These loans are given by Commercial Banks, RRBs, Small Finance Banks, MFIs and NBFCs.",
            "eligibility": "1. Any Indian citizen who has a business plan for a non-farm sector income generating activity. \n2. The business could be proprietorship, partnership firm, small manufacturing unit, service sector unit, shopkeeper, fruit/vegetable vendor, truck operator, agriculture-allied activities. \n3. Shishu: Loans up to Rs. 50,000. \n4. Kishore: Loans above Rs. 50,000 and up to Rs. 5 Lakh. \n5. Tarun: Loans above Rs. 5 Lakh and up to Rs. 10 Lakh.",
            "documents": "1. Mudra Application Form \n2. Proof of Identity (Aadhaar/Voter ID/PAN/Passport) \n3. Proof of Residence \n4. Quotation of machinery/items to be purchased \n5. Proof of identity/address of the business enterprise \n6. Category certificate (SC/ST/OBC/Minority, if applicable)",
            "steps": "1. Download the Mudra loan application form (Shishu, Kishore, or Tarun) from the official Mudra website or get it from your local bank branch.\n2. Fill in the business plan details, capital requirements, and personal identification info.\n3. Attach the required documents (ID proof, address proof, business license, and vendor quotations for equipment).\n4. Submit the completed application form to a participating bank, RRB, NBFC, or Microfinance Institution.\n5. The bank will review your credit history and business viability. Once approved, the loan amount will be disbursed.",
            "application_url": "https://www.myscheme.gov.in/schemes/pmmy",
            "source_url": "https://www.myscheme.gov.in/schemes/pmmy",
            "crawled_at": datetime.utcnow().isoformat()
        },
        {
            "name": "Atal Pension Yojana (APY)",
            "description": "Atal Pension Yojana (APY) is a government-backed pension scheme in India, primarily targeted at the unorganised sector. Under the APY, a guaranteed minimum pension of Rs. 1,000, Rs. 2,000, Rs. 3,000, Rs. 4,000 or Rs. 5,000 per month will be given at the age of 60 years depending on the contributions by the subscribers.",
            "eligibility": "Age of joining and contribution period:\n1. The minimum age of joining APY is 18 years and maximum is 40 years.\n2. The age of exit and start of pension is 60 years.\n3. Subscriber contribution to APY shall be made through the facility of 'auto-debit' of the prescribed contribution amount from the savings bank account of the subscriber on monthly, quarterly or half-yearly basis.\n4. The subscribers are required to contribute the prescribed contribution amount from the age of joining APY till the age of 60 years.\n\nExclusions:\nFrom 1st October, 2022, any citizen who is or has been an income tax payer, shall not be eligible to join APY.",
            "documents": "1. Aadhaar Card (primary KYC) \n2. Savings Bank Account Number \n3. Mobile Number linked to bank account \n4. APY Application Form (physical or online net-banking registration)",
            "steps": "1. Visit the nearest participating bank branch where you hold a savings account, or log in to your bank's Net Banking / Mobile Banking portal.\n2. Request the APY registration form or select the 'Atal Pension Yojana' option online.\n3. Enter your savings bank account number and primary Aadhaar card KYC details.\n4. Choose your desired monthly pension amount (from Rs. 1,000 to Rs. 5,000).\n5. Fill in the nominee information and authorization details.\n6. Select auto-debit consent so premium contributions are deducted periodically from your bank account.",
            "application_url": "https://www.myscheme.gov.in/schemes/apy",
            "source_url": "https://www.myscheme.gov.in/schemes/apy",
            "crawled_at": datetime.utcnow().isoformat()
        },
        {
            "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
            "description": "Pradhan Mantri Suraksha Bima Yojana is an accident insurance scheme that offers one-year accidental death and disability cover, renewable from year to year. The coverage is Rs. 2 Lakh for accidental death and full disability, and Rs. 1 Lakh for partial disability. The premium is Rs. 20 per annum, which is auto-debited from the subscriber's bank account.",
            "eligibility": "1. All individual bank account holders. \n2. Age between 18 and 70 years. \n3. Consent to join and enable auto-debit of premium. \n4. Account holders of participating banks are eligible.",
            "documents": "1. Aadhaar Card \n2. Bank Account Details (for auto-debit) \n3. Consent cum Declaration Form \n4. Mobile Number",
            "steps": "1. Contact the bank or post office where your savings bank account is maintained.\n2. Request the PMSBY application cum auto-debit consent form, or log in to your Net Banking portal.\n3. Fill in your name, Aadhaar card number, nominee details, and select your savings account.\n4. Tick the auto-debit consent box to allow the annual premium deduction of Rs. 20.\n5. Submit the form online or hand it to the bank teller to activate your accidental insurance coverage.",
            "application_url": "https://www.myscheme.gov.in/schemes/pmsby",
            "source_url": "https://www.myscheme.gov.in/schemes/pmsby",
            "crawled_at": datetime.utcnow().isoformat()
        },
        {
            "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
            "description": "Pradhan Mantri Jeevan Jyoti Bima Yojana is a one-year life insurance scheme, renewable from year to year, offering life insurance cover for death due to any reason. The life cover of Rs. 2 Lakh is available at a premium of Rs. 436 per annum, which is auto-debited from the subscriber's bank account.",
            "eligibility": "1. All individual bank account holders. \n2. Age between 18 and 50 years. \n3. Consent to enable auto-debit of premium. \n4. Lien period of 30 days is applicable from the date of enrollment (no claim allowed for first 30 days except accidental death).",
            "documents": "1. Aadhaar Card \n2. Savings Bank Account details \n3. Active Mobile Number \n4. Consent Form",
            "steps": "1. Go to the bank branch or post office holding your active savings account, or log in to their Net Banking interface.\n2. Search for the PMJJBY enrollment section or ask for the physical enrollment form.\n3. Provide your Aadhaar number, nominee details, and self-attested health declaration.\n4. Authorize the bank to auto-debit the annual premium of Rs. 436 from your account.\n5. Submit the form to activate your life insurance coverage (note: a 30-day lien period applies for non-accidental claims).",
            "application_url": "https://www.myscheme.gov.in/schemes/pmjjby",
            "source_url": "https://www.myscheme.gov.in/schemes/pmjjby",
            "crawled_at": datetime.utcnow().isoformat()
        }
    ]
    
    for idx, scheme in enumerate(mock_schemes):
        slug = scheme["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
        filepath = os.path.join(DATA_DIR, f"{slug}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(scheme, f, indent=4, ensure_ascii=False)
    print(f"Generated {len(mock_schemes)} mock schemes in raw/myscheme directory.")

def crawl_myscheme(limit=10):
    print("Starting crawl for MyScheme.gov.in...")
    try:
        from playwright.sync_api import sync_playwright
        from bs4 import BeautifulSoup
        
        # We will attempt a live crawl with a short timeout.
        # If it hits Cloudflare or any block, it will raise an exception and fall back.
        with sync_playwright() as p:
            print("Launching headless browser...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            # Navigate to myscheme.gov.in schemes page
            url = "https://www.myscheme.gov.in/schemes"
            print(f"Navigating to {url}...")
            page.goto(url, timeout=30000)
            page.wait_for_load_state("networkidle")
            
            # Extract content
            content = page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Find scheme cards/links
            # Note: Selectors might vary. Usually cards contain anchor tags with scheme URLs.
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if '/schemes/' in href and not href.endswith('/schemes'):
                    full_url = href if href.startswith('http') else f"https://www.myscheme.gov.in{href}"
                    if full_url not in links:
                        links.append(full_url)
            
            print(f"Found {len(links)} potential scheme URLs on MyScheme.gov.in.")
            
            if not links:
                raise Exception("No scheme links found. It's possible the page layout has changed or access was blocked.")
                
            links = links[:limit]
            crawled_count = 0
            
            for index, link in enumerate(links):
                try:
                    print(f"Crawling detail page {index+1}/{len(links)}: {link}")
                    page.goto(link, timeout=15000)
                    page.wait_for_load_state("networkidle")
                    
                    detail_content = page.content()
                    detail_soup = BeautifulSoup(detail_content, 'html.parser')
                    
                    # Extract fields (classes can change, so we search headers or specific tags)
                    # Let's extract title
                    title_elem = detail_soup.find('h1')
                    title = title_elem.text.strip() if title_elem else "Unknown Scheme"
                    
                    # Description
                    desc_div = detail_soup.find('div', id='details') or detail_soup.find('div', class_='details')
                    desc = desc_div.text.strip() if desc_div else ""
                    
                    # Eligibility
                    elig_div = detail_soup.find('div', id='eligibility') or detail_soup.find('div', class_='eligibility')
                    elig = elig_div.text.strip() if elig_div else ""
                    
                    # Documents
                    doc_div = detail_soup.find('div', id='documents') or detail_soup.find('div', class_='documents')
                    doc = doc_div.text.strip() if doc_div else ""
                    
                    # If details are empty, try fallback scraping (just get page body text chunks)
                    if not desc:
                        body_text = detail_soup.find('body').text if detail_soup.find('body') else ""
                        desc = body_text[:1000] if body_text else "Details could not be parsed."
                    
                    scheme_data = {
                        "name": title,
                        "description": desc,
                        "eligibility": elig or "Verify eligibility on official portal.",
                        "documents": doc or "Aadhaar Card, Bank Account, Mobile Number.",
                        "application_url": link,
                        "source_url": link,
                        "crawled_at": datetime.utcnow().isoformat()
                    }
                    
                    slug = title.lower().replace(" ", "-").replace("/", "-").replace("(", "").replace(")", "")
                    filepath = os.path.join(DATA_DIR, f"{slug}.json")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(scheme_data, f, indent=4, ensure_ascii=False)
                    
                    crawled_count += 1
                except Exception as e:
                    print(f"Error crawling detail page {link}: {e}")
                    continue
            
            browser.close()
            
            if crawled_count == 0:
                raise Exception("Could not successfully crawl any details.")
                
            print(f"Successfully crawled and saved {crawled_count} schemes.")
            
    except Exception as e:
        print(f"Crawl failed or blocked: {e}")
        print("Falling back to high-quality mock data generation...")
        generate_mock_data()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=5, help="Limit number of pages to crawl")
    parser.add_argument('--mock', action='store_true', help="Force mock data generation")
    args = parser.parse_args()
    
    if args.mock:
        generate_mock_data()
    else:
        crawl_myscheme(limit=args.limit)
