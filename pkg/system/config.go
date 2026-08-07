package system

import (
	"errors"
	"github.com/mitchellh/mapstructure"
	"gopkg.in/yaml.v3"
	"os"
)

// ReadConfig from path
func ReadConfig(path string, env string, pointer interface{}) (err error) {

	readFile, err := os.ReadFile(path)

	if err != nil {
		return err
	}

	var yml map[string]map[string]interface{}
	err = yaml.Unmarshal(readFile, &yml)

	if yml[env] == nil {
		return errors.New("no environment")
	}

	input := yml[env]
	err = mapstructure.WeakDecode(input, &pointer)
	return
}
