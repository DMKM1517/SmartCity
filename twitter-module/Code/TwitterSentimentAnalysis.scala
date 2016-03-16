import java.sql.DriverManager

import SentimentAnalysisUtils._
import org.apache.spark.streaming.twitter.TwitterUtils
import org.apache.spark.streaming.{Seconds, StreamingContext}
import org.apache.spark.{SparkConf, SparkContext}

import scala.collection.mutable

/**
  * Created by krishna on 03/03/16.
  */
object TwitterSentimentAnalysis  {

  def main(args: Array[String]) {
    val conf = new SparkConf().setAppName("Smart City Application")
      .setSparkHome("/Users/krishna/spark")
      .setMaster("local[3]")


    val keywords = mutable.ListBuffer[String]()
    val connection = DriverManager.getConnection("jdbc:postgresql://25.145.132.49:5432/smart", "dmkm", "dmkm1234")
    val rs = connection.createStatement()
    val key = rs.executeQuery("select nom from ip.interest_points where in_use = cast(1 as bit)")
    //val key = rs.executeQuery("select keywords from  twitter.keywords")
    while (key.next) {

      keywords += key.getString("keywords")

    }


    val sc = new SparkContext(conf)
    val ssc = new StreamingContext(sc, Seconds(1))

    val tweets = TwitterUtils.createStream(ssc,None,keywords)
    //val tweets = TwitterUtils.createStream(ssc,None)



    val tweet = tweets .map( t => {
      Map(
        "id" -> t.getId,
        "user"-> t.getUser.getScreenName,
        "text" -> t.getText,
        "retweet" -> t.getRetweetCount,
        "lat" -> Option(t.getGeoLocation).map(geo =>  {s"${geo.getLatitude}"})  ,
        "long" -> Option(t.getGeoLocation).map(geo =>  {s"${geo.getLongitude}"}),
        "sentiment" -> detectSentiment(t.getText),
        "language" -> t.getLang
      )})
    //tweet.print()

    tweet.foreachRDD { rdd =>
      rdd.foreachPartition { partitionOfRecords =>
        // ConnectionPool is a static, lazily initialized pool of connections
        val connection = DriverManager.getConnection("jdbc:postgresql://25.145.132.49:5432/smart","dmkm","dmkm1234")
        val prep = connection.prepareStatement("INSERT INTO twitter.twitter_feed (id,username,tweet,retweet,language,sentiment,lat,long,time) VALUES (?,?,?,?,?,?,?,?,current_timestamp);")
        for (tuple <- partitionOfRecords) {
          prep.setLong(1, tuple.apply("id").asInstanceOf[Long])
          prep.setString(2, tuple.apply("user").toString)
          prep.setString(3, tuple.apply("text").toString)
          prep.setInt(4, tuple.apply("retweet").asInstanceOf[Int])
          prep.setString(5, tuple.apply("language").toString)
          prep.setDouble(6, tuple.apply("sentiment").asInstanceOf[Double])
          prep.setString(7, tuple.apply("lat").toString)
          prep.setString(8, tuple.apply("long").toString)
          prep.executeUpdate
          //println("OP =========> "+ tuple)
        }
        connection.close()

      }
    }

    ssc.start()
    ssc.awaitTermination()


  }

}
