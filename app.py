import urllib.request
import xml.etree.ElementTree as ET
import time
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Simple in-memory cache
cache = {
    "data": None,
    "last_fetched": 0
}
CACHE_DURATION = 300  # 5 minutes

def fetch_release_notes():
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        xml_data = response.read()
    
    root = ET.fromstring(xml_data)
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    entries = root.findall('atom:entry', ns)
    
    notes = []
    for entry in entries:
        title_el = entry.find('atom:title', ns)
        id_el = entry.find('atom:id', ns)
        updated_el = entry.find('atom:updated', ns)
        link_el = entry.find('atom:link', ns)
        content_el = entry.find('atom:content', ns)
        
        # Parse link href
        link_href = ""
        if link_el is not None:
            link_href = link_el.attrib.get('href', '')
            
        note = {
            "title": title_el.text.strip() if title_el is not None and title_el.text else "Unknown Date",
            "id": id_el.text.strip() if id_el is not None and id_el.text else "",
            "updated": updated_el.text.strip() if updated_el is not None and updated_el.text else "",
            "link": link_href,
            "content": content_el.text.strip() if content_el is not None and content_el.text else ""
        }
        notes.append(note)
    return notes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    bypass_cache = request.args.get('refresh', 'false').lower() == 'true'
    current_time = time.time()
    
    if bypass_cache or cache["data"] is None or (current_time - cache["last_fetched"]) > CACHE_DURATION:
        try:
            notes = fetch_release_notes()
            cache["data"] = notes
            cache["last_fetched"] = current_time
        except Exception as e:
            # If fetch fails but we have cached data, return cached data
            if cache["data"] is not None:
                return jsonify({
                    "notes": cache["data"],
                    "source": "cache_fallback",
                    "error": str(e)
                })
            return jsonify({"error": f"Failed to fetch release notes: {str(e)}"}), 500
            
    return jsonify({
        "notes": cache["data"],
        "source": "cache" if not bypass_cache else "fresh"
    })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
