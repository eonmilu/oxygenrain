package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"

	_ "github.com/lib/pq"
)

const (
	// ConfigPath : path to the user, password and database
	ConfigPath = "/cfg/psql.cfg"
)

type dbcfg struct {
	User     string
	Password string
	Database string
}

func connectDb(cfg dbcfg) (*sql.DB, error) {
	dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s", cfg.User, cfg.Password, cfg.Database)
	db, err := sql.Open("postgres", dbinfo)
	if err != nil {
		return nil, err
	}
	return db, nil
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
