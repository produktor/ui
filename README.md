# Produktor.io

Marketplace to buy and sell products and services.

## Features

- Object recognition from webcam
- Object recognition from image
- Put recognition result into marketplace
- Find products and services by recognition result

## Getting Started

### Prerequisites

- Golang 1.19

#### No need to:

- Install any database
- Install npm, webpack, yarn, etc
- Install any other dependency

## Running the tests

### Unit tests

```bash
go test ./...
```

### Web service

To run local web service:

```bash
go run cmd/web-service/main.go
```


## Ideas

* Use YOLO and Darknet to detect objects 
  * https://github.com/pjreddie/darknet
  * https://pjreddie.com/darknet/yolov2/
  * https://habr.com/ru/post/700794/
  * https://github.com/spmallick/learnopencv
  * https://www.youtube.com/watch?v=OS5qI9YBkfk
* Try OWL-VT for object recognition
  * https://huggingface.co/docs/transformers/v4.26.1/en/model_doc/owlvit#transformers.OwlViTForObjectDetection
* Collet ideas from:
  * https://www.md.ai/
  * https://slundberg.github.io/shap/notebooks/deep_explainer/Keras%20LSTM%20for%20IMDB%20Sentiment%20Classification.html
* Use
  * https://transcranial.github.io/keras-js/#/image-super-resolution
  * https://github.com/transcranial/keras-js
  * https://github.com/microsoft/onnxruntime-web-demo
  * onnx
    * https://github.com/owulveryck/onnx-go
    * https://onnxruntime.ai/index.html#getStartedTable
* Geo-Service Suche auf basis von AI 
  * DE-Strassen als GeoJSON https://geoobserver.wordpress.com/2023/03/01/zeit-de-suche-nach-strasen-und-platzen-interaktiv/ bereits intern vornaden hier ~/Projects/data
  * 
## Free nomittim


* https://nominatim.qgis.org/ui/search.html
```bash
curl 'https://geocoding.geofabrik.de/b74413d43f121a21b544bcef1b0c7fcc/search?q=Tenerife,spain,san%20francisco&limit=5&format=json&addressdetails=1'   -H 'authority: geocoding.geofabrik.de'   -H 'accept: */*'   -H 'accept-language: en-US,en;q=0.9'   -H 'referer: https://www.geofabrik.de/'   -H 'sec-ch-ua: "Chromium";v="110", "Not A(Brand";v="24", "Brave";v="110"'   -H 'sec-ch-ua-mobile: ?0'   -H 'sec-ch-ua-platform: "Linux"'   -H 'sec-fetch-dest: script'   -H 'sec-fetch-mode: no-cors'   -H 'sec-fetch-site: same-site'   -H 'sec-gpc: 1'   -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'   --compressed | yq -P

```
