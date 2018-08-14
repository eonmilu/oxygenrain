package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	goyt "github.com/eonmilu/goyt"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

const (
	// FilePath : path to the files to be served
	FilePath = "/var/www/public/"
	// CertPath : path to the TLS certificate file
	CertPath = "/etc/letsencrypt/archive/oxygenrain.com/cert1.pem"
	// KeyPath : path to the TLS private key file
	KeyPath = "/etc/letsencrypt/archive/oxygenrain.com/privkey1.pem"
	// RootDomain : A-record of the domain
	RootDomain = "oxygenrain.com"
	// ConfigPath : path to the user, password and database
	ConfigPath = "/etc/postgresql/dietpi.cfg"
)

var (
	// DBInfo contains the credentials needed to access the database encoded in JSON
	dbinfo string
	// DB is the database object representing the Your Time database
	DB *sql.DB
	// DBCfg is a struct containing the raw credentials
	dbcfg struct {
		User     string
		Password string
		Database string
	}
	yourtime = goyt.YourTime{
		AuthTokenURL:   "https://www.googleapis.com/oauth2/v3/tokeninfo?",
		GoogleClientID: "817145568720-9p70ci9se6tpvn4qh9vbldh16gssfs3v.apps.googleusercontent.com",
		DB:             DB,
	}
)

func init() {
	raw, err := ioutil.ReadFile(ConfigPath)
	if err != nil {
		log.Panic(err)
	}
	err = json.Unmarshal(raw, &dbcfg)
	if err != nil {
		log.Panic(err)
	}
	dbinfo = fmt.Sprintf("user=%s password=%s dbname=%s", dbcfg.User, dbcfg.Password, dbcfg.Database)
	DB, err = sql.Open("postgres", dbinfo)
	if err != nil {
		log.Panic(err)
	}
}

func main() {
	defer DB.Close()
	// Redirect the incoming HTTP request to HTTPS
	go http.ListenAndServe(":8080", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		target := RootDomain + r.URL.RequestURI()
		http.Redirect(w, r, "https://"+target, http.StatusMovedPermanently)
		log.Printf("REDIRECT %s FROM %s TO %s", r.RemoteAddr, "http://"+target, "https://"+target)
	}))
	r := mux.NewRouter()
	r.HandleFunc("/yourtime/search", yourtime.Search)
	r.HandleFunc("/yourtime/insert", yourtime.Insert)
	r.HandleFunc("/yourtime/auth/token", yourtime.Auth)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(FilePath)))

	log.Panic(http.ListenAndServeTLS(":8443", CertPath, KeyPath, r))
}
