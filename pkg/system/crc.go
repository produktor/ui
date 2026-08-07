package system

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"mime/multipart"
)

// CheckSum calculates the sha256 hash of a file
func CheckSum(file multipart.File) (string, error) {
	h := sha256.New()
	if _, err := io.Copy(h, file); err != nil {
		return "", nil
	}

	// Revert
	file.Seek(0, 0)

	value := hex.EncodeToString(h.Sum(nil))
	return value, nil
}
