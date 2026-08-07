module github.com/produktor/ui

go 1.19

require (
	github.com/mitchellh/mapstructure v1.5.0
	github.com/vmware-labs/yaml-jsonpath v0.3.2
	gopkg.in/yaml.v3 v3.0.1
)

require (
	github.com/dprotaso/go-yit v0.0.0-20191028211022-135eb7262960 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	golang.org/x/xerrors v0.0.0-20220907171357-04be3eba64a2 // indirect
	google.golang.org/protobuf v1.28.1 // indirect
)

require github.com/tensorflow/tensorflow v2.11.0+incompatible

require (
	github.com/google/go-cmp v0.5.7 // indirect
	github.com/google/tsl v0.0.0+incompatible // indirect
	github.com/stretchr/testify v1.7.0 // indirect
	golang.org/x/net v0.0.0-20210614182718-04defd469f4e // indirect
	golang.org/x/sys v0.0.0-20210630005230-0f9fa26af87c // indirect
	golang.org/x/text v0.3.7 // indirect
)

replace github.com/google/tsl => /home/eslider/go/src/github.com/google/tsl
replace github.com/tensorflow/tensorflow => /home/eslider/go/src/github.com/tensorflow/tensorflow
