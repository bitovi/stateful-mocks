package main

import (
  "encoding/json"
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

var cmd *exec.Cmd
func restartStaticService() {
  var err error

  if (cmd != nil && cmd.Process != nil) {
    err = cmd.Process.Kill()
    if err != nil {
      log.Fatal(err)
    }
  }

	cmd = exec.Command("node", "node-app/app.js")
	err = cmd.Start()

	if err != nil {
		log.Fatal(err)
	}
}

type route struct {
  Rethod string `json:"method"`
  Rath string `json:"path"`
  ReturnValue string `json:"returnValue"`
}

var routes = []route{
  route{"get", "/", "0"},
}
func writeRouteModule() {
  routesJson, err := json.Marshal(routes)
  if err != nil {
    log.Fatal(err)
  }
  os.WriteFile("node-app/routes.json", routesJson, 0666)
}

func main() {
  // read the current routes file into memory

  // if routes file does not exist, write out default
  writeRouteModule()

  // start static service
  restartStaticService()

  // when route file changes, update routes in memory

  // when route file changes, restart static service
  go watch("node-app/routes.json", restartStaticService)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    // update route file, restart static service
    // proxy request to static service
    fmt.Fprintf(w, "Hello from Go")
  })

	log.Fatal(http.ListenAndServe(":3001", nil))
}
