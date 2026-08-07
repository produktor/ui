package file

// This package makes it easier to implement tests to load data from a files.
//
// NOTE: Although it was not explicitly mentioned in the task,
// I decided to make the GetModRootPath() function return path and an error if `go.mod` was not found.

import (
	"errors"
	"os"
	"path/filepath"
	"runtime"
)

// GetModRootPath get the root path of the module
func GetModRootPath() (string, error) {
	// Get caller filePath
	_, path, _, _ := runtime.Caller(0)
	// Get base directory by file info
	var prevPath string
	for {
		path = filepath.Dir(path)

		if IsExist(path + "/go.mod") {
			return path, nil
		}
		// Break if we reach root directory: '/'
		// Break if prevPath is same, maybe on Windows, something like C:// or c:\\
		if prevPath == path || len(path) < 2 {
			break
		}

		prevPath = path
	}
	return "", errors.New("go.mod not found")
}

// IsExist the path and isn't directory
func IsExist(path string) bool {
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
