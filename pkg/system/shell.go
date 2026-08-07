package system

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

type ShellCommandResult struct {
	StdOut   string
	StdErr   string
	ExitCode int
	Called   exec.Cmd
	Args     []string
}

func (r ShellCommandResult) HasError() bool {
	return len(r.StdErr) > 0
}

func (r ShellCommandResult) GetError() error {
	return errors.New(r.StdErr)
}

// Exec shell command
func Exec(args ...string) (*ShellCommandResult, error) {

	var stdout, stderr bytes.Buffer
	cmd := exec.Command(args[0], args[1:]...)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()

	if err != nil {
		return nil, err
	}

	c := ShellCommandResult{
		Args:     args,
		StdOut:   string(cmd.Stdout.(*bytes.Buffer).Bytes()),
		StdErr:   string(cmd.Stderr.(*bytes.Buffer).Bytes()),
		ExitCode: cmd.ProcessState.ExitCode(),
	}

	if c.HasError() {
		return &c, c.GetError()
	}

	return &c, nil
}

type FileInfo struct {
	Name     string
	BaseName string
	Dir      string
	Ext      string
}

func GetFileInfo(path string) FileInfo {
	// Get the file name
	dir, fileFullName := filepath.Split(path)

	// Extract file name and extension
	ext := filepath.Ext(path)

	// Get file base name
	fileName := fileFullName[0 : len(fileFullName)-len(ext)]

	return FileInfo{
		Name:     fileFullName,
		BaseName: fileName,
		Dir:      dir,
		Ext:      ext,
	}
}

// IsFileExists checks if a file exists
func IsFileExists(f string) bool {
	info, err := os.Stat(f)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

// IsLaunchedByDebugger checks if the current process is launched by the Delve debugger
// See https://stackoverflow.com/questions/47879070/how-can-i-see-if-the-goland-debugger-is-running-in-the-program
func IsLaunchedByDebugger() bool {
	// gops executable must be in the path. See https://github.com/google/gops
	gopsOut, err := exec.Command("gops", strconv.Itoa(os.Getppid())).Output()
	if err == nil && strings.Contains(string(gopsOut), "\\dlv.exe") {
		// our parent process is (probably) the Delve debugger
		return true
	}
	return false
}
