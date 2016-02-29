package eu.dmkm.smartcity
import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.SparkConf
import org.apache.spark.streaming.StreamingContext
import org.apache.spark.streaming.Seconds
import org.apache.spark.streaming.twitter.TwitterUtils
import twitter4j.TwitterFactory
import scala.io.Source
import org.apache.spark.sql.SQLContext
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.DataFrame
import eu.dmkm.smartcity.SentimentAnalysisUtils._

object twitstream {
  
  def main(args: Array[String]) {
  
    val jarloc = "/Users/krishna/Documents/workspace/spark/target/spark-0.0.1-SNAPSHOT.jar"
    val conf = new SparkConf().setAppName("Twitter 2 Application")
    .setSparkHome("/Users/krishna/spark")
    .setMaster("local[4]")
    
    .setJars(List(jarloc))
    val sc = new SparkContext(conf)
    val ssc = new StreamingContext(sc, Seconds(1))
    val sqlContext = new SQLContext(sc)
    val tweets = TwitterUtils.createStream(ssc,None,List("good")).filter(_.getLang == "en")
    val tweet = tweets.map( t => {
         Map(
           "id" -> t.getId,
           "user"-> t.getUser.getScreenName,
           "text" -> t.getText,
           "retweet" -> t.getRetweetCount,
           "lat" -> Option(t.getGeoLocation).map(geo =>  {s"${geo.getLatitude}"})  ,
           "long" -> Option(t.getGeoLocation).map(geo =>  {s"${geo.getLongitude}"}) ,
           "sentiment" -> detectSentiment(t.getText).toString()
         )})
  
    tweet.print()
    
    
    ssc.start()
    ssc.awaitTermination()
  }

}