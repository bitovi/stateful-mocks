package main

import (
  "fmt"
	"log"
	"net/http"
	"os"
  "os/exec"
	"time"
)

func watch(filePath string, cb func()) error {
  lastStat, err := os.Stat(filePath)

	if err != nil {
    return err
	}

	for {
		stat, err := os.Stat(filePath)
		if err != nil {
			return err
		}

		if stat.Size() != lastStat.Size() || stat.ModTime() != lastStat.ModTime() {
      cb()
		}

    lastStat = stat
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

func nodemon(program string) {
	cmd := exec.Command("node", program)

	err := cmd.Start()
	if err != nil {
		log.Fatal(err)
	}

  watch(program, func() {
    log.Printf("%s changed", program)

    err = cmd.Process.Kill()
    if err != nil {
      log.Fatal(err)
    }
    log.Println("Process killed")

    cmd = exec.Command("node", program)
    err = cmd.Start()
    if err != nil {
      log.Fatal(err)
    }
    log.Println("Process restarted")
  })
}

func main() {
	go nodemon("node-app/app.js")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello from Go")
  })
	log.Fatal(http.ListenAndServe(":3001", nil))
}
