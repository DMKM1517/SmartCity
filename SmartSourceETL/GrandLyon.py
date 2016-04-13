
# coding: utf-8

# In[1]:

import requests
import json

## Retreive all the interest points from the open data
print('Retreiving IPs Information from GrandLyon Open Data')

headers = {
    'Host' : 'download.data.grandlyon.com',
    'User-Agent' : 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0',
    'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language' : 'en-US,en;q=0.5',
    'Accept-Encoding' : 'gzip, deflate, br',
    'Connection' : 'keep-alive',
    'Cache-Control' : 'max-age=0'
}

payload = {
    'SERVICE' : 'WFS',
    'VERSION' : '2.0.0',
    'outputformat' : 'GEOJSON',
    'maxfeatures' : '30000',
    'request' : 'GetFeature',
    'typename' : 'sit_sitra.sittourisme',
    'SRSNAME' : 'urn:ogc:def:crs:EPSG::4171'
}

url = 'https://download.data.grandlyon.com/wfs/rdata'

r = requests.get(url, headers=headers, params=payload)
response = r.json()

interest_points = []
for i in range(0,len(response['features'])):

    cord_lat = '0'
    cord_long = '0'
    coordinates = response['features'][i]['geometry']['coordinates']
    if coordinates is not None:
        cord_long = str(coordinates[0])
        cord_lat = str(coordinates[1])
    
    ip = {
            "id" : response['features'][i]['properties']['id'],
            "type" : response['features'][i]['properties']['type'],
            "type_detail" : response['features'][i]['properties']['type_detail'],
            "nom" : response['features'][i]['properties']['nom'],
            "adresse" : response['features'][i]['properties']['adresse'],
            "codepostal" : response['features'][i]['properties']['codepostal'],
            "commune" : response['features'][i]['properties']['commune'],
            "telephone" : response['features'][i]['properties']['telephone'],
            "fax" : response['features'][i]['properties']['fax'],
            "telephonefax" : response['features'][i]['properties']['telephonefax'],
            "email" : response['features'][i]['properties']['email'],
            "siteweb" : response['features'][i]['properties']['siteweb'],
            "facebook" : response['features'][i]['properties']['facebook'],
            "classement" : response['features'][i]['properties']['classement'],
            "ouverture" : response['features'][i]['properties']['ouverture'],
            "tarifsenclair" : response['features'][i]['properties']['tarifsenclair'],
            "tarifsmin" : response['features'][i]['properties']['tarifsmin'],
            "tarifsmax" : response['features'][i]['properties']['tarifsmax'],
            "producteur" : response['features'][i]['properties']['producteur'],
            "date_creation" : response['features'][i]['properties']['date_creation'],
            "last_update" : response['features'][i]['properties']['last_update'],
            #"last_update_fme" : response['features'][i]['properties']['last_update_fme'],
            "coordinates_lat" : cord_lat,
            "coordinates_long" : cord_long
        }
    interest_points.append(ip)

print('{0} Interest Points retreived.'.format(len(interest_points)))


# In[2]:

import io 
import psycopg2
import sys
import pprint

print('Connecting to database')

#Define our connection string
with io.open('../login.json') as log:
    login = json.load(log)

conn_string = "host="+login["host"]+" dbname="+login["dbname"]+" user="+login["user"]+" password="+login["password"]
# print the connection string we will use to connect
print("Connecting to database")
 # get a connection, if a connect cannot be made an exception will be raised here
conn = psycopg2.connect(conn_string)
 # conn.cursor will return a cursor object, you can use this cursor to perform queries
cursor = conn.cursor()
print("Connected!")


# In[3]:

## Insert records in Landing Table
print('Inserting IPs into the database')

try:
    #Truncates the Landing table
    query = "TRUNCATE TABLE landing.ip_interest_points;"
    cursor.execute(query)
    conn.commit()

    # query to insert all the records
    query = """
        INSERT INTO landing.ip_interest_points (
            id,
            type,
            type_detail,
            name,
            address,
            postal_code,
            commune,
            telephone,
            fax,
            telephone_fax,
            email,
            website,
            facebook,
            ranking,
            open_hours,
            price,
            price_min,
            price_max,
            producer,
            source_create_date,
            source_last_update,
            coordinates_lat,
            coordinates_long
        ) VALUES (
            %(id)s,
            %(type)s,
            %(type_detail)s,
            %(nom)s,
            %(adresse)s,
            %(codepostal)s,
            %(commune)s,
            %(telephone)s,
            %(fax)s,
            %(telephonefax)s,
            %(email)s,
            %(siteweb)s,
            %(facebook)s,
            %(classement)s,
            %(ouverture)s,
            %(tarifsenclair)s,
            %(tarifsmin)s,
            %(tarifsmax)s,
            %(producteur)s,
            %(date_creation)s,
            %(last_update)s,
            %(coordinates_lat)s,
            %(coordinates_long)s
        );"""

    cursor.executemany(query, interest_points)
    conn.commit()
        
    #TODO: Log Success
    print('{0} records inserted in the database.'.format(len(interest_points)))


except psycopg2.DatabaseError as e:
    
    if conn:
        conn.rollback()
    
    #TODO: Log Error.
    print('Error {0}'.format(e))   
    sys.exit(1)
    
    
finally:
    if conn:
        conn.close()


# In[ ]:



