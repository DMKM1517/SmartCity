package Rest;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Iterator;

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
                    //System.out.println(longitude + " | " + latitude);
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
            stmt.execute("TRUNCATE TABLE ip.interest_points;");
            stmt.close();

            String query = "";
            query += "INSERT INTO ip.interest_points (";
            query += "\r\n   id, ";
            query += "\r\n   id_sitra1, ";
            query += "\r\n   \"type\", ";
            query += "\r\n   type_detail, ";
            query += "\r\n   nom, ";
            query += "\r\n   adresse, ";
            query += "\r\n   codepostal, ";
            query += "\r\n   commune, ";
            query += "\r\n   telephone, ";
            query += "\r\n   fax, ";
            query += "\r\n   telephonefax, ";
            query += "\r\n   email, ";
            query += "\r\n   siteweb, ";
            query += "\r\n   facebook, ";
            query += "\r\n   classement, ";
            query += "\r\n   ouverture, ";
            query += "\r\n   tarifsenclair, ";
            query += "\r\n   tarifsmin, ";
            query += "\r\n   tarifsmax, ";
            query += "\r\n   producteur, ";
            query += "\r\n   gid, ";
            query += "\r\n   date_creation, ";
            query += "\r\n   last_update, ";
            query += "\r\n   last_update_fme, ";
            query += "\r\n   coordinates_lat, ";
            query += "\r\n   coordinates_long, ";
            query += "\r\n   sentiment)";
            query += "\r\nVALUES(";
            query += "\r\n   ?,";
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
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ?, ";
            query += "\r\n   ? ";
            query += "\r\n)";
            query += "\r\n";

            //System.out.println(query);

            PreparedStatement updateStmt = c.prepareStatement(query);
            for (InterestPoint point : interestPoints) {

                // TODO: Change this
                // Randomizes the sentiment
                point.sentiment = (int) (Math.random() * 10) - 5;

                updateStmt.setInt(1, Integer.parseInt(point.id));
                updateStmt.setString(2, point.id_sitra1);
                updateStmt.setString(3, point.type);
                updateStmt.setString(4, point.type_detail);
                updateStmt.setString(5, point.nom);
                updateStmt.setString(6, point.adresse);
                updateStmt.setString(7, point.codepostal);
                updateStmt.setString(8, point.commune);
                updateStmt.setString(9, point.telephone);
                updateStmt.setString(10, point.fax);
                updateStmt.setString(11, point.telephonefax);
                updateStmt.setString(12, point.email);
                updateStmt.setString(13, point.siteweb);
                updateStmt.setString(14, point.facebook);
                updateStmt.setString(15, point.classement);
                updateStmt.setString(16, point.ouverture);
                updateStmt.setString(17, point.tarifsenclair);
                updateStmt.setString(18, point.tarifsmin);
                updateStmt.setString(19, point.tarifsmax);
                updateStmt.setString(20, point.producteur);
                updateStmt.setString(21, point.gid);
                updateStmt.setString(22, point.date_creation);
                updateStmt.setString(23, point.last_update);
                updateStmt.setString(24, point.last_update_fme);
                updateStmt.setDouble(25, point.coordinates_lat);
                updateStmt.setDouble(26, point.coordinates_long);
                updateStmt.setInt(27, point.sentiment);

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

    public static final String IP = "25.145.132.49";
    public static final String PORT = "5432";
    public static final String DB_NAME = "smart";
    public static final String DB_USER = "dmkm";
    public static final String DB_PWD = "dmkm1234";

    public Connection getConnection() {
        Connection c = null;
        try {
            Class.forName("org.postgresql.Driver");
            c = DriverManager.getConnection("jdbc:postgresql://" + IP + ":" + PORT + "/" + DB_NAME, DB_USER, DB_PWD);
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

    public static void main(String[] args) {
        RestRequest req = new RestRequest();
        req.readInterestPoints();
    }
}
