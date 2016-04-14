#!/bin/bash

#Move to the scripts folder
cd "${0%/*}"

#Start Grand Lyon
now=$(date)
echo "Starting Retreival from Grand Lyon: $now"
echo "####################################################################################################" >> 1_RetreiveFromSources.log 2>&1
echo "Starting Retreival from Grand Lyon: $now" >> 1_RetreiveFromSources.log 2>&1

# Retreive all IPs
python ../SmartSourceETL/GrandLyon.py >> 1_RetreiveFromSources.log 2>&1

../../kettle-data-integration/pan.sh -file="../SmartCity/ETL_Kettle_Editables/ETL_Smart_1_IP.ktr" -level=Basic >> 1_RetreiveFromSources.log 2>&1

#End Grand Lyon
now=$(date)
echo "End Retreive from Grand Lyon: $now"
echo "End Retreive from Grand Lyon: $now" >> 1_RetreiveFromSources.log 2>&1

#Start Yelp
now=$(date)
echo "Starting Retreival from Yelp: $now"
echo "####################################################################################################" >> 1_RetreiveFromSources.log 2>&1
echo "Starting Retreival from Yelp: $now" >> 1_RetreiveFromSources.log 2>&1

# Retreive all IPs
python ../SmartSourceETL/Yelp.py >> 1_RetreiveFromSources.log 2>&1

../../kettle-data-integration/pan.sh -file="../SmartCity/ETL_Kettle_Editables/ETL_Smart_2_Yelp.ktr" -level=Basic >> 1_RetreiveFromSources.log 2>&1

#End Yelp
now=$(date)
echo "End Retreive from Yelp: $now"
echo "End Retreive from Yelp: $now" >> 1_RetreiveFromSources.log 2>&1



#Start Foursquare
now=$(date)
echo "Starting Retreival from Foursquare: $now"
echo "####################################################################################################" >> 1_RetreiveFromSources.log 2>&1
echo "Starting Retreival from Foursquare: $now" >> 1_RetreiveFromSources.log 2>&1

# Retreive all IPs
python ../SmartSourceETL/Foursquare.py >> 1_RetreiveFromSources.log 2>&1

../../kettle-data-integration/pan.sh -file="../SmartCity/ETL_Kettle_Editables/ETL_Smart_3_Foursquare.ktr" -level=Basic >> 1_RetreiveFromSources.log 2>&1

#End Foursquare
now=$(date)
echo "End Retreive from Foursquare: $now"
echo "End Retreive from Foursquare: $now" >> 1_RetreiveFromSources.log 2>&1

echo "####################################################################################################" >> 1_RetreiveFromSources.log 2>&1
