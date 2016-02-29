package eu.dmkm.smartcity

import java.util.Properties
import java.util.Properties
import edu.stanford.nlp.ling.CoreAnnotations
import edu.stanford.nlp.neural.rnn.RNNCoreAnnotations
import edu.stanford.nlp.pipeline.StanfordCoreNLP
import edu.stanford.nlp.sentiment.SentimentCoreAnnotations
import scala.collection.JavaConversions._
import scala.collection.mutable.ListBuffer
import edu.stanford.nlp.pipeline.SentenceAnnotator

object SentimentAnalysisUtils {

  val nlpProps = {
    val props = new Properties()
    props.setProperty("annotators", "tokenize, ssplit, parse, sentiment")
    props
  }

  def detectSentiment(message: String): Double = {
    val pipeline = new StanfordCoreNLP(nlpProps)
    val annotation = pipeline.process(message)
    var sentiments: ListBuffer[Double] = ListBuffer()
    var sizes: ListBuffer[Int] = ListBuffer()

    var longest = 0
    var mainSentiment = 0

    for (sentence <- annotation.get(classOf[CoreAnnotations.SentencesAnnotation])) {
      val tree = sentence.get(classOf[SentimentCoreAnnotations.AnnotatedTree])
      val sentiment = RNNCoreAnnotations.getPredictedClass(tree)
      val partText = sentence.toString
      
      if (partText.length() > longest) {
        mainSentiment = sentiment
        longest = partText.length()
      }

   
      
    }

    return mainSentiment
  }
  def main(args: Array[String]): Unit = {
    println(detectSentiment("I love you and this is awesome. I am so happy this is great and i am very exited i cannot be more happy in my life"))
    println(detectSentiment("This is negative, I have every thing and my life sucks"))
  }


}