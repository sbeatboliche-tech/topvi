import re, time, json, requests

env = open('.env', encoding='utf-8').read()
def g(k): return re.search(rf'^{k}=(.*)$', env, re.M).group(1).strip()
TOK, ACC, VER = g('META_ACCESS_TOKEN'), g('META_AD_ACCOUNT_ID'), g('META_API_VERSION') or 'v25.0'
BASE = f'https://graph.facebook.com/{VER}'
PAGE = '990038874192743'
LINK = 'https://www.topviralmarketing.com.ar/ar'
VIDEO = r'C:/Users/Agus/Desktop/proyectoseguidores/branding/meta/Copia de SEGUID0RES.mp4'
THUMB = r'C:/Users/Agus/Desktop/proyectoseguidores/branding/meta/SEGUID0RES.png'

# IG identity (ya vinculado)
ig = requests.get(f'{BASE}/{PAGE}', params={'fields':'instagram_business_account{id,username}','access_token':TOK}).json()
ig_id = (ig.get('instagram_business_account') or {}).get('id')
print('IG:', ig.get('instagram_business_account'))

# Conjunto "Seguidores"
adsets = requests.get(f'{BASE}/{ACC}/adsets', params={'fields':'id,name','access_token':TOK}).json()['data']
seg = next(a for a in adsets if a['name'].startswith('Seguidores'))
print('Adset Seguidores:', seg['id'])

# Subir thumbnail -> hash
with open(THUMB,'rb') as f:
    th = requests.post(f'{BASE}/{ACC}/adimages', data={'access_token':TOK}, files={'file':f}).json()
thumb_hash = list(th['images'].values())[0]['hash']
print('thumb hash ok')

# Subir video
with open(VIDEO,'rb') as f:
    vr = requests.post(f'{BASE}/{ACC}/advideos', data={'access_token':TOK}, files={'source':f}).json()
vid = vr['id']; print('video id:', vid)

# Esperar procesamiento
for _ in range(40):
    st = requests.get(f'{BASE}/{vid}', params={'fields':'status','access_token':TOK}).json()
    s = (st.get('status') or {}).get('video_status')
    print('  video status:', s)
    if s == 'ready': break
    time.sleep(8)

# Creative de video
story = {
    'page_id': PAGE,
    'video_data': {
        'video_id': vid,
        'image_hash': thumb_hash,
        'message': 'Sumá seguidores reales y convertí visitas en clientes. Sin contraseña · Garantía 90 días · Entrega en menos de 4 hs. 3 cuotas sin interés.',
        'title': 'Más seguidores, más ventas',
        'call_to_action': {'type':'SHOP_NOW','value':{'link':LINK}},
    },
}
if ig_id: story['instagram_user_id'] = ig_id
cre = requests.post(f'{BASE}/{ACC}/adcreatives', data={'name':'Creative_Video_Seguidores','object_story_spec':json.dumps(story),'access_token':TOK}).json()
print('creative:', cre)
if 'id' not in cre: raise SystemExit('creative fallo')

# Ad (pausado) en el conjunto de seguidores
ad = requests.post(f'{BASE}/{ACC}/ads', data={'name':'Seguidores_Video','adset_id':seg['id'],'creative':json.dumps({'creative_id':cre['id']}),'status':'PAUSED','access_token':TOK}).json()
print('AD:', ad)
