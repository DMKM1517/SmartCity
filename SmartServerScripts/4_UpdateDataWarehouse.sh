#!/bin/bash

#Move to the scripts folder
cd "${0%/*}"


echo "####################################################################################################" >> 4_UpdateDataWarehouse.log 2>&1

#Start IPs
now=$(date)
echo "Starting Update of DWH - Interest Points: $now"
echo "Starting Update of DWH - Interest Points: $now" >> 4_UpdateDataWarehouse.log 2>&1

# Sync IPs
../../kettle-data-integration/pan.sh -file="../SmartCity/ETL_Kettle_Editables/ETL_SmartDW_1_IP.ktr" -level=Basic >> 4_UpdateDataWarehouse.log 2>&1

#End IPs
now=$(date)
echo "End Update of DWH - Interest Points: $now"
echo "End Update of DWH - Interest Points: $now" >> 4_UpdateDataWarehouse.log 2>&1

#Start Locations
now=$(date)
echo "Starting Update of DWH - Locations: $now"
echo "Starting Update of DWH - Locations: $now" >> 4_UpdateDataWarehouse.log 2>&1

# Sync Locations
../../kettle-data-integration/pan.sh -file="../SmartCity/ETL_Kettle_Editables/ETL_SmartDW_2_Location.ktr" -level=Basic >> 4_UpdateDataWarehouse.log 2>&1

#End Locations
now=$(date)
echo "End Update of DWH - Locations: $now"
echo "End Update of DWH - Locations: $now" >> 4_UpdateDataWarehouse.log 2>&1


#Start FactTable
now=$(date)
echo "Starting Update of DWH - Fact Table: $now"
echo "Starting Update of DWH - Fact Table: $now" >> 4_UpdateDataWarehouse.log 2>&1

# Sync FactTable
../../kettle-data-integration/pan.sh -file="../SmartCity/ETL_Kettle_Editables/ETL_SmartDW_3_FactTable.ktr" -level=Basic >> 4_UpdateDataWarehouse.log 2>&1

#End FactTable
now=$(date)
echo "End Update of DWH - FactTable: $now"
echo "End Update of DWH - FactTable: $now" >> 4_UpdateDataWarehouse.log 2>&1

echo "####################################################################################################" >> 4_UpdateDataWarehouse.log 2>&1