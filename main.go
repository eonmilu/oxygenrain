package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/eonmilu/goyt"
	"github.com/gorilla/mux"
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
)

const (
	authTokenURL   = "https://www.googleapis.com/oauth2/v3/tokeninfo?"
	googleclientID = "817145568720-9p70ci9se6tpvn4qh9vbldh16gssfs3v.apps.googleusercontent.com"
)

var (
	// DB is the database object representing the Your Time database
	DB       *sql.DB
	yourtime goyt.YourTime
)

func init() {
	cfg := dbcfg{}
	err := cfg.getDbCredentials()
	if err != nil {
		log.Panic(err)
	}
	DB, err := connectDb(cfg)
	if err != nil {
		log.Panic(err)
	}
	yourtime = goyt.YourTime{
		AuthTokenURL:   authTokenURL,
		GoogleClientID: googleclientID,
		DB:             DB,
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
