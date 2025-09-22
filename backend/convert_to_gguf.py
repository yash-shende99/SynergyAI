# Create a Python script to examine your model
import torch
from transformers import AutoModel

model = AutoModel.from_pretrained('./synergyai_final_standalone_model/')
for name, param in model.named_parameters():
    if 'SCB' in name:
        print(f"Custom tensor: {name}, shape: {param.shape}")