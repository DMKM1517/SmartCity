sudo su
apt-get install -y python-pip git apache2 

cd /var/www/html
ln -s ~/ dmkm
cd 
git clone https://github.com/DMKM1517/SmartCity.git
python SmartCity/EC2_tweet/tweet.py >> tweet.txt
