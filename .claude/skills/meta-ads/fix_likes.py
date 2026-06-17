import re, json, requests
env = open('.env', encoding='utf-8').read()
def g(k): return re.search(rf'^{k}=(.*)$', env, re.M).group(1).strip()
TOK, ACC, VER = g('META_ACCESS_TOKEN'), g('META_AD_ACCOUNT_ID'), g('META_API_VERSION') or 'v25.0'
BASE = f'https://graph.facebook.com/{VER}'
PAGE = '990038874192743'
LINK = 'https://www.topviralmarketing.com.ar/ar'
IMG = r'C:/Users/Agus/Desktop/proyectoseguidores/branding/historiass/likesantimeta.png'

adsets = requests.get(f'{BASE}/{ACC}/adsets', params={'fields':'id,name','access_token':TOK}).json()['data']
ls = next(a for a in adsets if a['name'].startswith('Likes'))

# pausar ads viejos del conjunto
for ad in requests.get(f'{BASE}/{ls["id"]}/ads', params={'fields':'id,name','access_token':TOK}).json()['data']:
    requests.post(f'{BASE}/{ad["id"]}', data={'status':'PAUSED','access_token':TOK})

with open(IMG,'rb') as f:
    h = list(requests.post(f'{BASE}/{ACC}/adimages', data={'access_token':TOK}, files={'file':f}).json()['images'].values())[0]['hash']

story = {'page_id': PAGE, 'link_data': {
    'link': LINK,
    'message': 'Tus posteos rinden más con interacción real: más me gusta = más alcance = más ventas. Precio transparente, sin contraseña y con garantía. Entrega rápida.',
    'name': 'Más interacción al mejor precio',
    'image_hash': h,
    'call_to_action': {'type':'SHOP_NOW','value':{'link':LINK}},
}}
cre = requests.post(f'{BASE}/{ACC}/adcreatives', data={'name':'Creative_LIK3S','object_story_spec':json.dumps(story),'access_token':TOK}).json()
print('creative', cre)
ad = requests.post(f'{BASE}/{ACC}/ads', data={'name':'LIK3S_Oferta','adset_id':ls['id'],'creative':json.dumps({'creative_id':cre['id']}),'status':'PAUSED','access_token':TOK}).json()
print('AD', ad)
