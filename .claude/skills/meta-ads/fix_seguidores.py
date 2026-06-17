import re, json, requests
env = open('.env', encoding='utf-8').read()
def g(k): return re.search(rf'^{k}=(.*)$', env, re.M).group(1).strip()
TOK, ACC, VER = g('META_ACCESS_TOKEN'), g('META_AD_ACCOUNT_ID'), g('META_API_VERSION') or 'v25.0'
BASE = f'https://graph.facebook.com/{VER}'
PAGE = '990038874192743'
LINK = 'https://www.topviralmarketing.com.ar/ar'
IMG = r'C:/Users/Agus/Desktop/proyectoseguidores/branding/meta/SEGUID0RES.png'

ig = requests.get(f'{BASE}/{PAGE}', params={'fields':'instagram_business_account{id}','access_token':TOK}).json()
ig_id = (ig.get('instagram_business_account') or {}).get('id')

seg = next(a for a in requests.get(f'{BASE}/{ACC}/adsets', params={'fields':'id,name','access_token':TOK}).json()['data'] if a['name'].startswith('Seguidores'))

# pausar el anuncio de imagen viejo (texto roto), dejar el video
for ad in requests.get(f'{BASE}/{seg["id"]}/ads', params={'fields':'id,name','access_token':TOK}).json()['data']:
    if ad['name'].startswith('Ad_Seguidores'):
        requests.post(f'{BASE}/{ad["id"]}', data={'status':'PAUSED','access_token':TOK})
        print('pausado roto:', ad['name'])

with open(IMG,'rb') as f:
    h = list(requests.post(f'{BASE}/{ACC}/adimages', data={'access_token':TOK}, files={'file':f}).json()['images'].values())[0]['hash']

story = {'page_id': PAGE, 'link_data': {
    'link': LINK,
    'message': '¿Tu perfil tiene pocos seguidores? La gente confía en lo que ya es popular. Sumá seguidores reales y convertí visitas en clientes. Sin contraseña · Garantía 90 días · Entrega en menos de 4 hs. 3 cuotas sin interés.',
    'name': 'Más seguidores, más ventas',
    'image_hash': h,
    'call_to_action': {'type':'SHOP_NOW','value':{'link':LINK}},
}}
if ig_id: story['instagram_user_id'] = ig_id
cre = requests.post(f'{BASE}/{ACC}/adcreatives', data={'name':'Creative_Seguidores_Foto','object_story_spec':json.dumps(story, ensure_ascii=False).encode('utf-8'),'access_token':TOK}).json()
print('creative', cre)
ad = requests.post(f'{BASE}/{ACC}/ads', data={'name':'Seguidores_Foto','adset_id':seg['id'],'creative':json.dumps({'creative_id':cre['id']}),'status':'ACTIVE','access_token':TOK}).json()
print('AD', ad)
