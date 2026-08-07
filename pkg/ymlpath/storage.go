package ymlpath

import (
	"github.com/produktor/ui/pkg/file"
	"github.com/vmware-labs/yaml-jsonpath/pkg/yamlpath"
	"gopkg.in/yaml.v3"
	"os"
)

// Read returns a byte array from a yml file.
//   - filePath is the path to the yml file.
//   - searchRoot is a bool to search for the root(go.mod file) of the project.
func Read(filePath string, searchRoot bool) ([]byte, error) {
	if searchRoot {
		path, err := file.GetModRootPath()
		if err != nil {
			return nil, err
		}

		filePath = path + "/" + filePath
	}

	return os.ReadFile(filePath)
}

// GetStrings returns a string from a yml file.
//   - filePath is the path to the yml file
//   - ymlPath is the path to the string in the yml file
//   - searchRoot is a bool to search for the root(go.mod file) of the project
func GetStrings(filePath, ymlPath string, searchRoot bool) (result []string, err error) {
	// Read the yml file
	yml, err := Read(filePath, searchRoot)
	if err != nil {
		return
	}

	// Unmarshal the yml
	var n yaml.Node
	err = yaml.Unmarshal(yml, &n)
	if err != nil {
		return
	}

	// Create a path
	p, err := yamlpath.NewPath(ymlPath)
	if err != nil {
		return
	}

	// Find all list matching the path
	list, err := p.Find(&n)
	if err != nil {
		return
	}

	for _, token := range list {
		result = append(result, token.Value)
	}

	return result, nil
}

// GetString returns a string from a yml file
//   - filePath is the path to the yml file
//   - ymlPath is the path to the string in the yml file
//   - searchRoot is a bool to search for the root(go.mod file) of the project
func GetString(filePath, ymlPath string, searchRoot bool) (string, error) {
	l, err := GetStrings(filePath, ymlPath, searchRoot)
	if err != nil {
		return "", err
	}

	if l == nil || len(l) < 1 {
		return "", nil
	}

	return l[0], nil
}

func ReadScan(path string, v interface{}, searchRoot bool) error {
	yml, err := Read(path, searchRoot)
	if err != nil {
		return err
	}

	return yaml.Unmarshal(yml, &v)
}
