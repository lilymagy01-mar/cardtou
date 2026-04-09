import json
import codecs

try:
    with codecs.open('scratch/models.json', 'r', 'utf-16') as f:
        data = json.load(f)
    
    models = data.get('models', [])
    for m in models:
        methods = m.get('supportedGenerationMethods', [])
        if 'generateContent' in methods:
            print(f"Name: {m['name']} - Methods: {methods}")
except Exception as e:
    print(f"Error: {e}")
    # Try reading as utf-8 just in case
    try:
        with open('scratch/models.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        models = data.get('models', [])
        for m in models:
            methods = m.get('supportedGenerationMethods', [])
            if 'generateContent' in methods:
                print(f"Name: {m['name']} - Methods: {methods}")
    except Exception as e2:
        print(f"Error 2: {e2}")
