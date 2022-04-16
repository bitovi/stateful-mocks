package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"reflect"
	"strings"
	"time"
)

// https://stackoverflow.com/questions/8270441/go-language-how-detect-file-changing
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

var routesFileName = "node-app/routes.json"

func (service NodeService) writeRoutes() {
	routesJson, err := json.Marshal(service.routes)
	if err != nil {
		log.Fatal(err)
	}
	os.WriteFile(routesFileName, routesJson, 0666)
}

func (service *NodeService) loadRoutes() bool {
	routesJson, err := os.ReadFile(routesFileName)
	if err != nil {
		return false
	}
	var newRoutes []route
	err = json.Unmarshal(routesJson, &newRoutes)
	if err != nil {
		log.Fatal(err)
	}
	if !reflect.DeepEqual(service.routes, newRoutes) {
		service.routes = newRoutes
		return true
	}
	return false
}

func (service *NodeService) start() {
	service.cmd = exec.Command("node", "demo/server.js")

	stdout, err := service.cmd.StdoutPipe()
	if err != nil {
		log.Fatal(err)
	}

	err = service.cmd.Start()
	if err != nil {
		log.Fatal(err)
	}

	var out struct {
		Status string `json:"status"`
		url    string `json:"url"`
	}

	for {
		err = json.NewDecoder(stdout).Decode(&out)
		if err != nil {
			log.Fatal(err)
		}

		if out.Status == "listening" {
			return
		}

		time.Sleep(50 * time.Millisecond)
	}
}

func (service *NodeService) restart() {
	if service.cmd != nil && service.cmd.Process != nil {
		err := service.cmd.Process.Kill()
		if err != nil {
			log.Fatal(err)
		}
	}

	service.start()
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
		// https://stackoverflow.com/questions/49745252/reverseproxy-depending-on-the-request-body-in-golang
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.Fatal(err)
		}

		// read request body
		req := string(body)
		if !strings.Contains(req, "query IntrospectionQuery") {
			fmt.Println(req)
		}

		// assign a new body with previous byte slice
		r.Body = ioutil.NopCloser(bytes.NewBuffer(body))

		// update route file
		// service.updateRoutes(strings.ToLower(r.Method), r.URL.String())

		// restart static service
		// service.restart()

		// proxy request to static service
		staticServiceProxy.ServeHTTP(w, r)
	}
}

func main() {
	nodeService := NodeService{routes: []route{}}

	// read the current routes file into memory
	loaded := nodeService.loadRoutes()

	// if routes file does not exist, write out default
	if !loaded {
		nodeService.writeRoutes()
	}

	// start static service
	nodeService.start()

	// when route file changes, update routes in memory
	// and restart if necessary
	go watch("node-app/routes.json", func() {
		changed := nodeService.loadRoutes()
		if changed {
			nodeService.restart()
		}
	})

	// initialze proxy to static service
	url, err := url.Parse("http://localhost:4000")
	if err != nil {
		log.Fatal(err)
	}
	staticServiceProxy, err := httputil.NewSingleHostReverseProxy(url), nil
	if err != nil {
		log.Fatal(err)
	}

	// handle all requests using the proxy handler
	http.HandleFunc("/", nodeService.ProxyRequestHandler(staticServiceProxy))

	log.Fatal(http.ListenAndServe(":4001", nil))
}
