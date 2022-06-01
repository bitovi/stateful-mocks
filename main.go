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

// TODO - pass this as an argument
var configFileName = "demo/config.json"

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

type StatefulEntityConfig struct {
	Name  string `json:"name"`
	Id    string `json:"id"`
	State string `json:"state"`
}
type StateConfig struct {
	State string      `json:"state"`
	Data  interface{} `json:"data"`
}
type InstanceConfig struct {
	Id     string        `json:"id"`
	States []StateConfig `json:"states"`
}
type EntityConfig struct {
	Name      string           `json:"name"`
	Instances []InstanceConfig `json:"instances"`
}
type RequestConfig struct {
	Method       string                 `json:"method"`
	Path         string                 `json:"path"`
	Body         interface{}            `json:"body"`
	Response     StatefulEntityConfig   `json:"response"`
	StateChanges []StatefulEntityConfig `json:"stateChanges"`
}
type Config struct {
	Entities []EntityConfig  `json:"entities"`
	Requests []RequestConfig `json:"requests"`
}
type StaticMockServer struct {
	config  Config
	cmd     *exec.Cmd
	running bool
}

func (service StaticMockServer) writeConfig() {
	configJson, err := json.MarshalIndent(service.config, "", "  ")
	if err != nil {
		log.Fatal("Unable to write config file ", err)
	}
	os.WriteFile(configFileName, configJson, 0666)
}

func (service *StaticMockServer) loadConfig() bool {
	configJson, err := os.ReadFile(configFileName)
	if err != nil {
		return false
	}
	var newConfig Config
	err = json.Unmarshal(configJson, &newConfig)
	if err != nil {
		log.Fatal("Unable to load config ", err)
	}
	if !reflect.DeepEqual(service.config, newConfig) {
		service.config = newConfig
		return true
	}
	return false
}

func (service *StaticMockServer) start() {
	service.cmd = exec.Command("node", "static/server.js", "4001")

	stdout, err := service.cmd.StdoutPipe()
	if err != nil {
		log.Fatal("Unable to get stdout pipe from static service ", err)
	}

	err = service.cmd.Start()
	if err != nil {
		log.Fatal("Unable to start static service ", err)
	}

	var serverStatusOutput struct {
		Status string `json:"status"`
	}

	for {
		err = json.NewDecoder(stdout).Decode(&serverStatusOutput)
		if err != nil {
			log.Fatal("Unable to decode static service stdout ", err)
		}

		if serverStatusOutput.Status == "listening" {
			service.running = true
			return
		}

		time.Sleep(10 * time.Millisecond)
	}
}

func (service *StaticMockServer) restart() {
	if service.cmd != nil && service.cmd.Process != nil {
		service.running = false
		err := service.cmd.Process.Kill()

		if err != nil {
			log.Fatal("Failed to kill static server ", err)
		}
	}

	service.start()
}

func (service *StaticMockServer) updateConfig(method string, path string, body string) bool {
	newRequest := true

	for _, r := range service.config.Requests {
		if r.Method == method && r.Path == path && r.Body == body {
			newRequest = false
		}
	}

	if newRequest {
		newRequestConfig := RequestConfig{
			method,
			path,
			body,
			StatefulEntityConfig{},
			[]StatefulEntityConfig{},
		}

		// TODO - make this real code
		if strings.Contains(body, "mutation") {
			service.config.Entities = []EntityConfig{
				EntityConfig{
					"Person",
					[]InstanceConfig{
						InstanceConfig{
							"Nils",
							[]StateConfig{
								StateConfig{
									"created",
									map[string]interface{}{
										"name": "Nils",
										"age":  35,
									},
								},
							},
						},
						InstanceConfig{
							"2",
							[]StateConfig{
								StateConfig{
									"state1",
									map[string]interface{}{
										"name": "Margaret",
										"age":  47,
									},
								},
							},
						},
					},
				},
			}

			newRequestConfig.Response = StatefulEntityConfig{
				"Person",
				"2",
				"state1",
			}

			newRequestConfig.StateChanges = []StatefulEntityConfig{
				StatefulEntityConfig{
					"Person",
					"2",
					"state1",
				},
			}
		} else {
			newRequestConfig.Response = StatefulEntityConfig{
				"Person",
				"1",
				"state1",
			}

			service.config.Entities = []EntityConfig{
				EntityConfig{
					"Person",
					[]InstanceConfig{
						InstanceConfig{
							"1",
							[]StateConfig{
								StateConfig{
									"state1",
									map[string]interface{}{
										"name": "Mark",
										"age":  9,
									},
								},
							},
						},
					},
				},
			}
		}
		// END TODO - make this real code

		service.config.Requests = append(service.config.Requests, newRequestConfig)
		service.writeConfig()
		return true
	}

	return false
}

type GraphQLRequest struct {
	Query         string                 `json:"query"`
	Variables     map[string]interface{} `json:"variables"`
	OperationName string                 `json:"operationName"`
}

// ProxyRequestHandler handles the http request using proxy
func (service *StaticMockServer) ProxyRequestHandler(staticServiceProxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// https://stackoverflow.com/questions/49745252/reverseproxy-depending-on-the-request-body-in-golang
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.Fatal("Unable to read request body ", err)
		}

		// read request body
		req := string(body)
		isEmptyQuery := len(body) == 0
		isIntrospectionQuery := strings.Contains(req, "query IntrospectionQuery")

		if !isEmptyQuery && !isIntrospectionQuery {
			// update config file
			configChanged := service.updateConfig(strings.ToUpper(r.Method), r.URL.String(), req)

			if configChanged {
				// restart static service
				service.restart()
			}
		}

		// assign a new body with previous byte slice
		r.Body = ioutil.NopCloser(bytes.NewBuffer(body))

		// proxy request to static service
		// if static service is restarting, wait
		for {
			if service.running {
				staticServiceProxy.ServeHTTP(w, r)
				return
			}

			time.Sleep(50 * time.Millisecond)
		}
	}
}

func main() {
	staticMockService := StaticMockServer{
		config: Config{
			Entities: []EntityConfig{},
			Requests: []RequestConfig{},
		},
	}

	// read the current config file into memory
	loaded := staticMockService.loadConfig()

	// if config file does not exist, write out default
	if !loaded {
		staticMockService.writeConfig()
	}

	// start static service
	staticMockService.start()

	// when config file changes, update config in memory
	// and restart if necessary
	go watch(configFileName, func() {
    fmt.Println("File changed")
		changed := staticMockService.loadConfig()
		if changed {
			if staticMockService.running {
				fmt.Println("config file changed... restarting")
				staticMockService.restart()
			}
		}
	})

	// initialze proxy to static service
	url, err := url.Parse("http://localhost:4001")
	if err != nil {
		log.Fatal("Unable to parse URL ", err)
	}
	staticServiceProxy, err := httputil.NewSingleHostReverseProxy(url), nil
	if err != nil {
		log.Fatal("Unable to create single host proxy ", err)
	}

	// handle all requests using the proxy handler
	http.HandleFunc("/", staticMockService.ProxyRequestHandler(staticServiceProxy))

	fmt.Println("Listening on 4000")
	log.Fatal(http.ListenAndServe(":4000", nil))
}
