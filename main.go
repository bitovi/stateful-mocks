package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"strings"
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

type route struct {
	Method      string `json:"method"`
	Path        string `json:"path"`
	ReturnValue int    `json:"returnValue"`
}

type NodeService struct {
	routes []route
	cmd    *exec.Cmd
}

func (service NodeService) writeRoutes() {
	routesJson, err := json.Marshal(service.routes)
	if err != nil {
		log.Fatal(err)
	}
	os.WriteFile("node-app/routes.json", routesJson, 0666)
}

func (service *NodeService) loadRoutes() {
	// TODO
}

func (service *NodeService) restart() {
	var err error

	if service.cmd != nil && service.cmd.Process != nil {
		err = service.cmd.Process.Kill()
		if err != nil {
			log.Fatal(err)
		}
	}

	service.cmd = exec.Command("node", "node-app/app.js")
	err = service.cmd.Start()

	if err != nil {
		log.Fatal(err)
	}
}

func (service *NodeService) updateRoutes(method string, path string) {
	existingRouteUpdated := false
	for i, r := range service.routes {
		if r.Method == method && r.Path == path {
			service.routes[i] = route{method, path, r.ReturnValue + 1}
			existingRouteUpdated = true
		}
	}
	if !existingRouteUpdated {
		service.routes = append(service.routes, route{method, path, 1})
	}
	service.writeRoutes()
}

// ProxyRequestHandler handles the http request using proxy
func (service *NodeService) ProxyRequestHandler(staticServiceProxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// update route file
		service.updateRoutes(strings.ToLower(r.Method), r.URL.String())

		// restart static service
		service.restart()

		// TODO - make restart not return until the service is started
		time.Sleep(200 * time.Millisecond)

		// proxy request to static service
		staticServiceProxy.ServeHTTP(w, r)
	}
}

func main() {
	nodeService := NodeService{routes: []route{}}

	// read the current routes file into memory
	nodeService.loadRoutes()

	// if routes file does not exist, write out default
	nodeService.writeRoutes()

	// start static service
	nodeService.restart()

	// when route file changes, update routes in memory
	go watch("node-app/routes.json", nodeService.loadRoutes)

	// when route file changes, restart static service
	// go watch("node-app/routes.json", nodeService.restart)

	// initialze proxy to static service
	url, err := url.Parse("http://localhost:3001")
	if err != nil {
		log.Fatal(err)
	}
	staticServiceProxy, err := httputil.NewSingleHostReverseProxy(url), nil
	if err != nil {
		log.Fatal(err)
	}

	// handle all requests using the proxy handler
	http.HandleFunc("/", nodeService.ProxyRequestHandler(staticServiceProxy))

	log.Fatal(http.ListenAndServe(":3000", nil))
}
