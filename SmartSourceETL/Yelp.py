
# coding: utf-8

# In[1]:

from yelp.client import Client
from yelp.oauth1_authenticator import Oauth1Authenticator


# In[3]:

import os
from inspect import getsourcefile
from os.path import abspath
import io
import json

#Makes we use the path of the script folder and it is correct

currentPath = abspath(getsourcefile(lambda:0))
if not currentPath.endswith('SmartSourceETL'):
    currentPath, garbage =  os.path.split(abspath(getsourcefile(lambda:0)))

cfs_path = '{0}/{1}'.format(currentPath, 'config_secret.json')
with io.open(cfs_path) as cred:
    creds = json.load(cred)
    auth = Oauth1Authenticator(**creds)
    client = Client(auth)


# In[5]:

import psycopg2
import sys
import pprint

print('Connecting to database')

cfl_path = '{0}/../{1}'.format(currentPath, 'login.json')
with io.open(cfl_path) as log:
    login = json.load(log)
#Define our connection string
conn_string = "host="+login["host"]+" dbname="+login["dbname"]+" user="+login["user"]+" password="+login["password"]

# get a connection, if a connect cannot be made an exception will be raised here
conn = psycopg2.connect(conn_string)
 # conn.cursor will return a cursor object, you can use this cursor to perform queries
cursor = conn.cursor()
print('Connected!')
cursor.execute("SELECT name,id FROM ip.interest_points where in_use = '1'")
records = cursor.fetchall()


# In[6]:

import re
import unicodedata


def strip_accents(text):
    """
    Strip accents from input String.

    :param text: The input string.
    :type text: String.

    :returns: The processed String.
    :rtype: String.
    """
    try:
        text = unicode(text, 'utf-8')
    except NameError: # unicode is a default on python 3 
        pass
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore')
    text = text.decode("utf-8")
    text = text.replace("\'"," ")
    text = text.replace(":","")
    text = text.replace("  "," ")
    text = text[0:60]
    return str(text)

def text_to_id(text):
    """
    Convert input text to id.

    :param text: The input string.
    :type text: String.

    :returns: The processed String.
    :rtype: String.
    """
    text = strip_accents(text.lower())
    text = re.sub('[ ]+', '_', text)
    text = re.sub('[^0-9a-zA-Z_-],', '', text)
    return text



# In[ ]:

print('Retreiving IPs Information from Yelp')

yelp = []
for i in range(0,len(records)):
    params = {
    'term': strip_accents(records[i][0]),
    'lang': 'fr'
    }
    response = client.search('Lyon', **params)
    if response.total !=0 :
        yelp.append([response.businesses[0].name,
        response.businesses[0].rating,
        response.businesses[0].location.coordinate.latitude,
        response.businesses[0].location.coordinate.longitude,
        response.businesses[0].image_url,
        response.businesses[0].phone,
        response.businesses[0].review_count,
        records[i][1]])
        
print('{0} IPs Retreived from Yelp.'.format(len(yelp)))


# In[ ]:

## Insert records in Landing Table
print('Inserting IPs into the database')

try:
    #Truncates the Landing table
    query = "TRUNCATE TABLE landing.ip_yelp;"
    cursor.execute(query)
    conn.commit

    for row in yelp:
        name = row[0]
        rating = row[1]
        latitude = row[2]
        longitude = row[3]
        image_url = row[4]
        phone = row[5]
        review_count = row[6]
        idd = row[7]

        query = """
            INSERT INTO landing.ip_yelp (
                name, rating, latitude, longitude, image_url, phone, review_count, idd
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s
            )"""
        data = (name, rating, latitude, longitude, image_url, phone, review_count, idd)

        cursor.execute(query,data)
        conn.commit()
    
    #TODO: Log Success in DB
    print('{0} records inserted in the database.'.format(len(yelp)))

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



