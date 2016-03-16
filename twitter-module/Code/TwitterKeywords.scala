import java.sql.DriverManager

import scala.collection.mutable

/**
  * Created by krishna on 07/03/16.
  */
object TwitterKeywords {


  def main(args: Array[String]) {
    val keywords = scala.collection.mutable.SortedSet[String]()
    val connection = DriverManager.getConnection("jdbc:postgresql://25.145.132.49:5432/smart", "dmkm", "dmkm1234")
    val rs = connection.createStatement()
    //val res = rs.executeQuery("select nom from ip.interest_points where in_use = cast(1 as bit)")
    val key = rs.executeQuery("select keywords from  twitter.keywords")

    while (key.next) {

      keywords += key.getString("keywords")
      //print("1 " +key.getString("keywords"))

    }




  }

  def keys(): mutable.SortedSet[String] ={
    val keywords = mutable.SortedSet[String]()
    val connection = DriverManager.getConnection("jdbc:postgresql://25.145.132.49:5432/smart", "dmkm", "dmkm1234")
    val rs = connection.createStatement()
    val res = rs.executeQuery("select * from twitter.keywords")

    while (res.next) {

      keywords += res.getString("nom")
    }
    return keywords
  }

}
