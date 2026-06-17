import re, json, requests
env = open('.env', encoding='utf-8').read()
def g(k): return re.search(rf'^{k}=(.*)$', env, re.M).group(1).strip()
TOK, ACC, VER = g('META_ACCESS_TOKEN'), g('META_AD_ACCOUNT_ID'), g('META_API_VERSION') or 'v25.0'
BASE = f'https://graph.facebook.com/{VER}'
PAGE = '990038874192743'
LINK = 'https://www.topviralmarketing.com.ar/ar'
IMG = r'C:/Users/Agus/Desktop/proyectoseguidores/branding/meta/SEGUID0RES.png'
VIDEO_ID = '993047503443562'  # ya subido antes

TITLE = 'Más seguidores, más ventas'
BODY_FOTO = '¿Tu perfil tiene pocos seguidores? La gente confía en lo que ya es popular. Sumá seguidores y convertí visitas en clientes. Sin contraseña · Con garantía · Entrega en menos de 4 hs. 3 cuotas sin interés.'
BODY_VIDEO = 'Sumá seguidores y convertí visitas en clientes. Sin contraseña · Con garantía · Entrega en menos de 4 hs. 3 cuotas sin interés.'

ig_id = (requests.get(f'{BASE}/{PAGE}', params={'fields':'instagram_business_account{id}','access_token':TOK}).json().get('instagram_business_account') or {}).get('id')
seg = next(a for a in requests.get(f'{BASE}/{ACC}/adsets', params={'fields':'id,name','access_token':TOK}).json()['data'] if a['name'].startswith('Seguidores'))

# pausar los activos viejos
for ad in requests.get(f'{BASE}/{seg["id"]}/ads', params={'fields':'id,name','access_token':TOK}).json()['data']:
    if ad['name'] in ('Seguidores_Foto', 'Seguidores_Video'):
        requests.post(f'{BASE}/{ad["id"]}', data={'status':'PAUSED','access_token':TOK})
        print('pausado', ad['name'])

with open(IMG,'rb') as f:
    h = list(requests.post(f'{BASE}/{ACC}/adimages', data={'access_token':TOK}, files={'file':f}).json()['images'].values())[0]['hash']

def creative(name, story):
    if ig_id: story['instagram_user_id'] = ig_id
    return requests.post(f'{BASE}/{ACC}/adcreatives', data={'name':name,'object_story_spec':json.dumps(story, ensure_ascii=False).encode('utf-8'),'access_token':TOK}).json()

def ad(name, cid):
    return requests.post(f'{BASE}/{ACC}/ads', data={'name':name,'adset_id':seg['id'],'creative':json.dumps({'creative_id':cid}),'status':'ACTIVE','access_token':TOK}).json()

cf = creative('Creative_Seg_Foto_v2', {'page_id':PAGE,'link_data':{'link':LINK,'message':BODY_FOTO,'name':TITLE,'image_hash':h,'call_to_action':{'type':'SHOP_NOW','value':{'link':LINK}}}})
print('foto cre', cf); print('foto ad', ad('Seguidores_Foto_v2', cf['id']))

cv = creative('Creative_Seg_Video_v2', {'page_id':PAGE,'video_data':{'video_id':VIDEO_ID,'image_hash':h,'message':BODY_VIDEO,'title':TITLE,'call_to_action':{'type':'SHOP_NOW','value':{'link':LINK}}}})
print('video cre', cv); print('video ad', ad('Seguidores_Video_v2', cv['id']))
