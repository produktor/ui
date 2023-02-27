///usr/bin/true; exec /usr/bin/env go run "$0" "$@"
//go:build ignore
// +build ignore

package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", fs)
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
