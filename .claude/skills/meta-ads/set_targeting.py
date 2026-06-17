import re, json, requests
env = open('.env', encoding='utf-8').read()
def g(k): return re.search(rf'^{k}=(.*)$', env, re.M).group(1).strip()
TOK, ACC, VER = g('META_ACCESS_TOKEN'), g('META_AD_ACCOUNT_ID'), g('META_API_VERSION') or 'v25.0'
BASE = f'https://graph.facebook.com/{VER}'

# Intereses de negocio / creadores (se resuelven a IDs; los que no matchean se omiten)
NAMES = [
    "Small business", "Business", "Entrepreneurship", "Social entrepreneurship",
    "Digital marketing", "Marketing", "Social media marketing", "Advertising",
    "Online advertising", "E-commerce", "Personal branding", "Influencer marketing",
    "Brand management", "Instagram", "Content creation",
]
interests = []
for n in NAMES:
    r = requests.get(f'{BASE}/search', params={'type':'adinterest','q':n,'limit':1,'access_token':TOK}).json()
    d = r.get('data') or []
    if d:
        interests.append({'id': d[0]['id'], 'name': d[0]['name']})
        print('OK', n, '->', d[0]['name'])
    else:
        print('skip', n)

seg = next(a for a in requests.get(f'{BASE}/{ACC}/adsets', params={'fields':'id,name','access_token':TOK}).json()['data'] if a['name'].startswith('Seguidores'))
cur = requests.get(f'{BASE}/{seg["id"]}', params={'fields':'targeting','access_token':TOK}).json()['targeting']
cur['age_min'] = 22
cur['age_max'] = 40
cur['flexible_spec'] = [{'interests': interests}]

up = requests.post(f'{BASE}/{seg["id"]}', data={'targeting': json.dumps(cur), 'access_token': TOK}).json()
print('targeting update:', up)
bud = requests.post(f'{BASE}/{seg["id"]}', data={'daily_budget':'600000','access_token':TOK}).json()
print('budget update:', bud)
print('TOTAL intereses:', len(interests))
