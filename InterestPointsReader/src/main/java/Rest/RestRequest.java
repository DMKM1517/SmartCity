package Rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Properties;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;

import edu.RestReader.entities.InterestPoint;

/**
 * Hello world!
 *
 */
public class RestRequest {

    private ArrayList<InterestPoint> interestPoints;

    public RestRequest() {
        this.interestPoints = new ArrayList<InterestPoint>();

    }

    public void readInterestPoints() {
        try {

            HttpResponse<JsonNode> jsonResponse = Unirest.get("https://download.data.grandlyon.com/wfs/rdata")
                    .header("Host", "download.data.grandlyon.com")
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:43.0) Gecko/20100101 Firefox/43.0")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.5").header("Accept-Encoding", "gzip, deflate")
                    .header("DNT", "1").header("Connection", "keep-alive").header("Cache-Control", "max-age=0")
                    .queryString("SERVICE", "WFS").queryString("VERSION", "2.0.0")
                    .queryString("outputformat", "GEOJSON").queryString("maxfeatures", "30000")
                    .queryString("request", "GetFeature").queryString("typename", "sit_sitra.sittourisme")
                    // .queryString("SRSNAME", "urn:ogc:def:crs:EPSG::4171")
                    .asJson();

            System.out.println();

            Object obj;
            JSONParser parser = new JSONParser();
            obj = parser.parse(jsonResponse.getBody().toString());
            JSONObject jsonObject = (JSONObject) obj;

            JSONArray featuresList = (JSONArray) jsonObject.get("features");
            @SuppressWarnings("unchecked")
            Iterator<JSONObject> features = featuresList.iterator();
            while (features.hasNext()) {
                JSONObject feature = features.next();

                InterestPoint point = new InterestPoint();
                JSONObject properties = (JSONObject) feature.get("properties");

                String sPoint = "";
                sPoint += "id: " + properties.get("id") + " | nom: " + properties.get("nom");
                // System.out.println(sPoint);

                point.setId(nullIfEmpty((String) properties.get("id")));
                point.setId_sitra1(nullIfEmpty((String) properties.get("id_sitra1")));
                point.setType(nullIfEmpty((String) properties.get("type")));
                point.setType_detail(nullIfEmpty((String) properties.get("type_detail")));
                point.setNom(nullIfEmpty((String) properties.get("nom")));
                point.setAdresse(nullIfEmpty((String) properties.get("adresse")));
                point.setCodepostal(nullIfEmpty((String) properties.get("codepostal")));
                point.setCommune(nullIfEmpty((String) properties.get("commune")));
                point.setTelephone(nullIfEmpty((String) properties.get("telephone")));
                point.setFax(nullIfEmpty((String) properties.get("fax")));
                point.setTelephonefax(nullIfEmpty((String) properties.get("telephonefax")));
                point.setEmail(nullIfEmpty((String) properties.get("email")));
                point.setSiteweb(nullIfEmpty((String) properties.get("siteweb")));
                point.setFacebook(nullIfEmpty((String) properties.get("facebook")));
                point.setClassement(nullIfEmpty((String) properties.get("classement")));
                point.setOuverture(nullIfEmpty((String) properties.get("ouverture")));
                point.setTarifsenclair(nullIfEmpty((String) properties.get("tarifsenclair")));
                point.setTarifsmin(nullIfEmpty((String) properties.get("tarifsmin")));
                point.setTarifsmax(nullIfEmpty((String) properties.get("tarifsmax")));
                point.setProducteur(nullIfEmpty((String) properties.get("producteur")));
                point.setGid(nullIfEmpty((String) properties.get("gid")));
                point.setDate_creation(nullIfEmpty((String) properties.get("date_creation")));
                point.setLast_update(nullIfEmpty((String) properties.get("last_update")));
                point.setLast_update_fme(nullIfEmpty((String) properties.get("last_update_fme")));

                JSONObject geometry = (JSONObject) feature.get("geometry");
                JSONArray coordinates = (JSONArray) geometry.get("coordinates");
                if (coordinates != null && coordinates.size() == 2) {
                    double longitude = (Double) coordinates.get(0);
                    double latitude = (Double) coordinates.get(1);

                    point.setCoordinates_long(longitude);
                    point.setCoordinates_lat(latitude);
                    // System.out.println(longitude + " | " + latitude);
                }

                // point.set nullIfEmpty((String)
                // properties.get("coordinates")));
                // System.out.println(point);
                interestPoints.add(point);

            }

            // Stats
            System.out.println("Interest Points Retreived: " + interestPoints.size());

            // runs the inserts into the db
            this.insertIntoDB();

            // System.out.println("END");
        } catch (

        Exception e)

        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public void insertIntoDB() {

        try {
            Connection c = this.getConnection();
            c.setAutoCommit(false);
            System.out.println("Opened database successfully");

            Statement stmt = c.createStatement();
            // Truncates the interest points
            stmt.execute("TRUNCATE TABLE landing.ip_interest_points;");
            stmt.close();

            String query = "";
            query += "INSERT INTO landing.ip_interest_points (";
            query += "\r\n   id, ";
            // query += "\r\n id_sitra1, ";
            query += "\r\n   \"type\", ";
            query += "\r\n   type_detail, ";
            query += "\r\n   name, ";
            query += "\r\n   address, ";
            query += "\r\n   postal_code, ";
            query += "\r\n   commune, ";
            query += "\r\n   telephone, ";
            query += "\r\n   fax, ";
            query += "\r\n   telephone_fax, ";
            query += "\r\n   email, ";
            query += "\r\n   website, ";
            query += "\r\n   facebook, ";
            query += "\r\n   ranking, ";
            query += "\r\n   open_hours, ";
            query += "\r\n   price, ";
            query += "\r\n   price_min, ";
            query += "\r\n   price_max, ";
            query += "\r\n   producer, ";
            query += "\r\n   source_create_date, ";
            query += "\r\n   source_last_update, ";
            // query += "\r\n last_update_fme, ";
            query += "\r\n   coordinates_lat, ";
            query += "\r\n   coordinates_long ";

            // query += "\r\n sentiment,";
            // query += "\r\n in_use)";
            query += "\r\n ) VALUES (";
            query += "\r\n   ?,";
            query += "\r\n   ?, ";
            // query += "\r\n ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ? ";
            query += "\r\n)";
            query += "\r\n";

            // System.out.println(query);

            PreparedStatement updateStmt = c.prepareStatement(query);
            for (InterestPoint point : interestPoints) {

                // TODO: Change this
                // Randomizes the sentiment
                point.sentiment = (int) (Math.random() * 10) - 5;

                updateStmt.setInt(1, Integer.parseInt(point.id));
                updateStmt.setString(2, point.type);
                updateStmt.setString(3, point.type_detail);
                updateStmt.setString(4, point.nom);
                updateStmt.setString(5, point.adresse);
                updateStmt.setString(6, point.codepostal);
                updateStmt.setString(7, point.commune);
                updateStmt.setString(8, point.telephone);
                updateStmt.setString(9, point.fax);
                updateStmt.setString(10, point.telephonefax);
                updateStmt.setString(11, point.email);
                updateStmt.setString(12, point.siteweb);
                updateStmt.setString(13, point.facebook);
                updateStmt.setString(14, point.classement);
                updateStmt.setString(15, point.ouverture);
                updateStmt.setString(16, point.tarifsenclair);
                updateStmt.setString(17, point.tarifsmin);
                updateStmt.setString(18, point.tarifsmax);
                updateStmt.setString(19, point.producteur);
                updateStmt.setString(20, point.date_creation);
                updateStmt.setString(21, point.last_update);
                // updateStmt.setString(23, point.last_update_fme);
                updateStmt.setDouble(22, point.coordinates_lat);
                updateStmt.setDouble(23, point.coordinates_long);
                // updateStmt.setInt(24, point.sentiment);
                // updateStmt.setString(25, "0");

                updateStmt.executeUpdate();
            }

            stmt.close();
            c.commit();
            c.close();

        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

    }

    public Connection getConnection() {
        Properties props = loadProperties();

        String ip = props.getProperty("ip");
        String port = props.getProperty("port");
        String db_name = props.getProperty("db_name");
        String db_user = props.getProperty("db_user");
        String db_pwd = props.getProperty("db_pwd");
        
        Connection c = null;
        try {
            Class.forName("org.postgresql.Driver");
            c = DriverManager.getConnection("jdbc:postgresql://" + ip + ":" + port + "/" + db_name, db_user, db_pwd);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
            System.exit(0);
        }
        return c;
    }

    public String nullIfEmpty(String value) {
        if (value == null || value.trim().isEmpty())
            return null;
        return value;
    }

    public Properties loadProperties() {
        InputStream inputStream = null;
        Properties prop = null;
        try {
            prop = new Properties();

            String propFileName = "./config.properties";
            inputStream = new FileInputStream(propFileName);
            if (inputStream != null) {
                prop.load(inputStream);
            } else {
                throw new FileNotFoundException("property file '" + propFileName + "' not found in the classpath");
            }
        } catch (Exception e) {
            System.out.println("Exception: " + e);
        } finally {
            try {
                inputStream.close();
            } catch (IOException e) {
            }
        }
        return prop;
    }

    public static void main(String[] args) {
        RestRequest req = new RestRequest();
        req.readInterestPoints();
    }
}
