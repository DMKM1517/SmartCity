name := "twitter-module"

version := "1.0"

scalaVersion := "2.10.4"

libraryDependencies ++= Seq("org.apache.spark" %% "spark-core" % "1.6.0" % "provided",
                            "org.apache.spark" %% "spark-mllib" % "1.6.0" % "provided",
                            "org.apache.spark" %% "spark-sql" % "1.6.0" % "provided",
                            "org.apache.spark" %% "spark-streaming" % "1.6.0" % "provided",
                            "org.apache.spark" %% "spark-streaming-twitter" % "1.6.0"
)


libraryDependencies ++= Seq(
  "edu.stanford.nlp" % "stanford-corenlp" % "3.6.0",
  "edu.stanford.nlp" % "stanford-corenlp" % "3.6.0" classifier "models",
  //"edu.stanford.nlp" % "stanford-corenlp" % "3.5.2" classifier "models-chinese",
  //"edu.stanford.nlp" % "stanford-corenlp" % "3.5.2" classifier "models-german",
  //"edu.stanford.nlp" % "stanford-corenlp" % "3.5.2" classifier "models-spanish",
  "edu.stanford.nlp" % "stanford-corenlp" % "3.6.0" classifier "models-french",
  "org.postgresql" % "postgresql" % "9.3-1100-jdbc4",
  "mysql" % "mysql-connector-java" % "5.1.12"
)



mainClass in assembly := some("TwitterSentimentAnalysis")
assemblyJarName := "twitter-smartcity.jar"

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", xs @ _*) => MergeStrategy.discard
  case x => MergeStrategy.first
}

