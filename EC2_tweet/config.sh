sudo su
apt-get install -y python-pip git apache2 

cd /var/www/html
ln -s ~/ dmkm
cd 
git clone https://github.com/DMKM1517/SmartCity.git
nohup python tweet.py >> tweet.txt

http://ec2-54-152-27-131.compute-1.amazonaws.com/dmkm/tweet.txt
