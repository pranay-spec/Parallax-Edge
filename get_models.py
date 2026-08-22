import requests
from dotenv import load_dotenv
import os

load_dotenv('backend/.env')
key = os.environ.get('GROQ_API_KEY')
res = requests.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {key}'})
print([m['id'] for m in res.json().get('data', [])])
