sudo su
apt-get install -y python-pip git apache2 

cd /var/www/html
ln -s ~/ dmkm
cd 
git clone https://github.com/DMKM1517/SmartCity.git
cd SmartCity/EC2_tweet
python tweet.py >> tweet.txt
