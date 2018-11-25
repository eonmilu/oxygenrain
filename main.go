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
	FilePath = "public/"
	// JWTSecretPath is the path to the JWT secret
	JWTSecretPath = "cfg/jwt.cfg"
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
		DB:        DB,
		JWTSecret: getJWTSecret(),
	}
}

func main() {
	defer DB.Close()

	r := mux.NewRouter()
	r.HandleFunc("/yourtime/search", yourtime.CreateUsers(yourtime.Search))
	r.HandleFunc("/yourtime/insert", yourtime.CreateUsers(yourtime.Insert))
	r.HandleFunc("/yourtime/votes", yourtime.CreateUsers(yourtime.Votes))
	r.HandleFunc("/yourtime/auth/validate", yourtime.CreateUsers(yourtime.ValidateAuth))
	r.HandleFunc("/yourtime/auth/remove", yourtime.CreateUsers(yourtime.RemoveAuth))
	r.HandleFunc("/yourtime/auth/tokens", yourtime.CreateUsers(yourtime.CreateVerifToken))
	go yourtime.RemoveOldVerifTokens()

	r.PathPrefix("/").Handler(http.FileServer(http.Dir(FilePath)))

	log.Panic(http.ListenAndServe(":8080", r))
}
