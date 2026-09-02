import urllib.request, re, ssl

def inspect():
    ctx = ssl.create_default_context()
    html = urllib.request.urlopen('https://jansahay-ai.netlify.app/', context=ctx).read().decode('utf-8')
    js_files = re.findall(r'/assets/[^\"]+\.js', html)
    print("JS Assets in index.html:", js_files)
    
    for js_file in js_files:
        url = f"https://jansahay-ai.netlify.app{js_file}"
        content = urllib.request.urlopen(url, context=ctx).read().decode('utf-8')
        urls = set(re.findall(r'https://[a-zA-Z0-9-]+\.onrender\.com', content))
        if urls:
            print(f"Asset {js_file} contains onrender URLs: {urls}")
        else:
            print(f"Asset {js_file} has no onrender URLs.")

if __name__ == '__main__':
    inspect()
