import requests
from PIL import Image
import torch
from transformers import AutoProcessor, OwlViTForObjectDetection

processor = AutoProcessor.from_pretrained("google/owlvit-base-patch16")



processor = AutoProcessor
inputs = processor(images=image, query_images=query_image, return_tensors="pt").from_pretrained(
    "google/owlvit-base-patch16")
model = OwlViTForObjectDetection.from_pretrained("google/owlvit-base-patch16")
url = "http://images.cocodataset.org/val2017/000000039769.jpg"
image = Image.open(requests.get(url, stream=True).raw)
query_url = "http://images.cocodataset.org/val2017/000000001675.jpg"
query_image = Image.open(requests.get(query_url, stream=True).raw)
with torch.no_grad():
    outputs = model.image_guided_detection(**inputs)
# Target image sizes (height, width) to rescale box predictions [batch_size, 2]
target_sizes = torch.Tensor([image.size[::-1]])
# Convert outputs (bounding boxes and class logits) to COCO API
results = processor.post_process_image_guided_detection(
    outputs=outputs, threshold=0.6, nms_threshold=0.3, target_sizes=target_sizes
)
i = 0  # Retrieve predictions for the first image
boxes, scores = results[i]["boxes"], results[i]["scores"]
for box, score in zip(boxes, scores):
    box = [round(i, 2) for i in box.tolist()]
    print(f"Detected similar object with confidence {round(score.item(), 3)} at location {box}")
