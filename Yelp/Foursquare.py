
# coding: utf-8

# In[6]:

import io 
import json
with io.open('config_secret_fs.json') as cred:
    creds = json.load(cred)


# In[7]:

import psycopg2
import sys
import pprint
#Define our connection string
conn_string = "host='50.16.139.89' dbname='smart' user='dmkm' password='dmkm1234'"
# print the connection string we will use to connect
print("Connecting to database")
 # get a connection, if a connect cannot be made an exception will be raised here
conn = psycopg2.connect(conn_string)
 # conn.cursor will return a cursor object, you can use this cursor to perform queries
cursor = conn.cursor()
print("Connected!")
cursor.execute("SELECT name,id FROM ip.interest_points where in_use = '1'")
records = cursor.fetchall()


# In[8]:

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
#response.total
#strip_accents(records[i][0])


# In[13]:

import requests
foursquare = []
for i in range(0,len(records)): #len(records)
    payload = {
    'near':'lyon',
    'query':strip_accents(records[i][0]),
    'client_id':creds['client_id'], 
    'client_secret':creds['client_secret'],
    'v':creds['v']
    }
    r = requests.get('https://api.foursquare.com/v2/venues/explore?',params=payload)
    response = r.json()
    if r.ok and len(response['response']['groups'][0]['items']) != 0 and 'rating' in response['response']['groups'][0]['items'][0]['venue'] :
        foursquare.append([   
                records[i][1],
                response['response']['groups'][0]['items'][0]['venue']['name'],
                response['response']['groups'][0]['items'][0]['venue']['stats']['checkinsCount'],
                response['response']['groups'][0]['items'][0]['venue']['stats']['tipCount'],
                response['response']['groups'][0]['items'][0]['venue']['stats']['usersCount'],
                response['response']['groups'][0]['items'][0]['venue']['rating']
                ]
        )


# In[14]:

foursquare[0]


# In[15]:

for row in foursquare:
    idd = row[0]
    name = row[1]
    checkinsCount = row[2]
    tipCount = row[3]
    usersCount = row[4]
    rating = row[5]
    
    query = "INSERT INTO landing.ip_foursquare (idd, name, checkinsCount, tipCount, usersCount, rating) VALUES (%s, %s, %s, %s, %s, %s)"
    data = (idd, name, checkinsCount, tipCount, usersCount, rating)
    
    cursor.execute(query,data)
    conn.commit()


# In[ ]:



