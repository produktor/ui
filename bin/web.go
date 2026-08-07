///usr/bin/true; exec /usr/bin/env go run "$0" "$@"
//go:build ignore
// +build ignore

package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

// Get PORT from environment us flag
var port = flag.String("port", "8000", "port to serve on")

func main() {
	var err error
	var portNum int

	// convert port to int
	portNum, err = strconv.Atoi(*port)
	if err != nil || portNum < 1 || portNum > 65535 {
		log.Fatal(err)
	}

	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", fs)
	host := fmt.Sprintf(":%d", portNum)
	fmt.Println("Listening on %s...", host)
	if err = http.ListenAndServe(host, nil); err != nil {
		log.Fatal(err)
	}
}
