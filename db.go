package main

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"

	_ "github.com/lib/pq"
)

const (
	// ConfigPath : path to the user, password and database
	ConfigPath = "/cfg/psql.cfg"
)

const (
	// LocalPostgresIP : IP used by the machine running postgres
	LocalPostgresIP = "192.168.1.48"
)

type dbcfg struct {
	User     string
	Password string
	Database string
}

func connectDb(cfg dbcfg) (*sql.DB, error) {
	// TODO: configure ssl mode
	dbinfo := "postgres://" + cfg.User + ":" + cfg.Password + "@" + LocalPostgresIP + "/" + cfg.Database + "?sslmode=disable"
	db, err := sql.Open("postgres", dbinfo)
	return db, err
}

func (cfg *dbcfg) getDbCredentials() error {
	raw, err := ioutil.ReadFile(ConfigPath)
	if err != nil {
		return err
	}
	err = json.Unmarshal(raw, &cfg)
	if err != nil {
		return err
	}
	return nil
}
