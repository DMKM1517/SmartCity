package edu.RestReader.entities;

public class InterestPoint {
	public String id;
	public String id_sitra1;
	public String type;
	public String type_detail;
	public String nom;
	public String adresse;
	public String codepostal;
	public String commune;
	public String telephone;
	public String fax;
	public String telephonefax;
	public String email;
	public String siteweb;
	public String facebook;
	public String classement;
	public String ouverture;
	public String tarifsenclair;
	public String tarifsmin;
	public String tarifsmax;
	public String producteur;
	public String gid;
	public String date_creation;
	public String last_update;
	public String last_update_fme;
	public double coordinates_lat;
	public double coordinates_long;
	public int sentiment;

	public InterestPoint() {
		super();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getId_sitra1() {
		return id_sitra1;
	}

	public void setId_sitra1(String id_sitra1) {
		this.id_sitra1 = id_sitra1;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getType_detail() {
		return type_detail;
	}

	public void setType_detail(String type_detail) {
		this.type_detail = type_detail;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getAdresse() {
		return adresse;
	}

	public void setAdresse(String adresse) {
		this.adresse = adresse;
	}

	public String getCodepostal() {
		return codepostal;
	}

	public void setCodepostal(String codepostal) {
		this.codepostal = codepostal;
	}

	public String getCommune() {
		return commune;
	}

	public void setCommune(String commune) {
		this.commune = commune;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public String getFax() {
		return fax;
	}

	public void setFax(String fax) {
		this.fax = fax;
	}

	public String getTelephonefax() {
		return telephonefax;
	}

	public void setTelephonefax(String telephonefax) {
		this.telephonefax = telephonefax;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSiteweb() {
		return siteweb;
	}

	public void setSiteweb(String siteweb) {
		this.siteweb = siteweb;
	}

	public String getFacebook() {
		return facebook;
	}

	public void setFacebook(String facebook) {
		this.facebook = facebook;
	}

	public String getClassement() {
		return classement;
	}

	public void setClassement(String classement) {
		this.classement = classement;
	}

	public String getOuverture() {
		return ouverture;
	}

	public void setOuverture(String ouverture) {
		this.ouverture = ouverture;
	}

	public String getTarifsenclair() {
		return tarifsenclair;
	}

	public void setTarifsenclair(String tarifsenclair) {
		this.tarifsenclair = tarifsenclair;
	}

	public String getTarifsmin() {
		return tarifsmin;
	}

	public void setTarifsmin(String tarifsmin) {
		this.tarifsmin = tarifsmin;
	}

	public String getTarifsmax() {
		return tarifsmax;
	}

	public void setTarifsmax(String tarifsmax) {
		this.tarifsmax = tarifsmax;
	}

	public String getProducteur() {
		return producteur;
	}

	public void setProducteur(String producteur) {
		this.producteur = producteur;
	}

	public String getGid() {
		return gid;
	}

	public void setGid(String gid) {
		this.gid = gid;
	}

	public String getDate_creation() {
		return date_creation;
	}

	public void setDate_creation(String date_creation) {
		this.date_creation = date_creation;
	}

	public String getLast_update() {
		return last_update;
	}

	public void setLast_update(String last_update) {
		this.last_update = last_update;
	}

	public String getLast_update_fme() {
		return last_update_fme;
	}

	public void setLast_update_fme(String last_update_fme) {
		this.last_update_fme = last_update_fme;
	}

	public double getCoordinates_lat() {
		return coordinates_lat;
	}

	public void setCoordinates_lat(double coordinates_lat) {
		this.coordinates_lat = coordinates_lat;
	}

	public double getCoordinates_long() {
		return coordinates_long;
	}

	public void setCoordinates_long(double coordinates_long) {
		this.coordinates_long = coordinates_long;
	}

	public int getSentiment() {
		return sentiment;
	}

	public void setSentiment(int sentiment) {
		this.sentiment = sentiment;
	}

	public String toString() {
		return "Id: " + this.id + " | Nom: " + this.nom;
	}
}
