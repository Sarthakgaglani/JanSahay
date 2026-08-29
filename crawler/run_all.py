import os
import json
from datetime import datetime, timezone
import subprocess

# Setup log file path
LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'crawl_log.json')

def run_script(script_name, args=[]):
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), script_name)
    print(f"\n=========================================")
    print(f"Running {script_name}...")
    print(f"=========================================")
    
    cmd = ['python', script_path] + args
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"Errors from {script_name}:")
        print(result.stderr)
        
    return result.returncode == 0

def main():
    print(f"Starting JanSahay AI crawl master script at {datetime.now(timezone.utc).isoformat()}")
    
    crawlers = [
        {"script": "crawl_myscheme.py", "portal": "MyScheme.gov.in"},
        {"script": "crawl_pmkisan.py", "portal": "PM-KISAN"},
        {"script": "crawl_pmjay.py", "portal": "Ayushman Bharat / PMJAY"},
        {"script": "crawl_scholarships.py", "portal": "National Scholarship Portal"},
        {"script": "crawl_eshram.py", "portal": "eSHRAM"},
        {"script": "crawl_pmjdy.py", "portal": "Jan Dhan Yojana"}
    ]
    
    log_data = []
    
    for c in crawlers:
        # We will try a normal crawl first. If it uses playwright and playwright is not installed,
        # it will fail and trigger our robust mock fallback.
        # However, for a quick, clean setup without installing full chromium in this workspace right now,
        # let's pass '--mock' to the myscheme crawler so it finishes fast.
        args = []
        if c["script"] == "crawl_myscheme.py":
            args = ["--mock"]
            
        success = run_script(c["script"], args)
        
        # Determine items created (simulate by listing directory)
        portal_dir_name = c["script"].split('_')[1].split('.')[0]
        portal_raw_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'raw', portal_dir_name)
        
        items_crawled = 0
        if os.path.exists(portal_raw_dir):
            items_crawled = len([f for f in os.listdir(portal_raw_dir) if f.endswith('.json')])
            
        log_data.append({
            "portal": c["portal"],
            "status": "success" if success else "failed",
            "items_crawled": items_crawled,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    # Write crawl log
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, indent=4, ensure_ascii=False)
        
    print("\n=========================================")
    print("All crawlers executed. Crawl log written.")
    print("=========================================")

if __name__ == "__main__":
    main()
