from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream

#Variables that contains the user credentials to access Twitter API 
access_token = "704075760911425536-4MtdO1Y2jwodAO4RVySs58AxctCy793"
access_token_secret = "9oK3yKORqE8HeQIxnjyxAfPtxtycV5nVfi6098ycvpjtz"
consumer_key = "veCGUZl0gNtO3wQlMS3qmMeql"
consumer_secret = "7tduIpmBPIZMUN7JtBIJjcRudwhIOp6Q8YRFMDMWoeFSqDIj0A"


#This is a basic listener that just prints received tweets to stdout.
class StdOutListener(StreamListener):

    def on_data(self, data):
        print data
        return True

    def on_error(self, status):
        print status


if __name__ == '__main__':

    #This handles Twitter authetification and the connection to Twitter Streaming API
    l = StdOutListener()
    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    stream = Stream(auth, l)

    #This line filter Twitter Streams to capture data by the keywords: 'python', 'javascript', 'ruby'
    stream.filter(track=['lyon'])