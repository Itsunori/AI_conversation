from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import io

import transformers
nlp = transformers.pipeline("conversational", model="microsoft/DialoGPT-medium")
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# model_name = "microsoft/DialoGPT-large"
model_name = "microsoft/DialoGPT-medium"
# model_name = "microsoft/DialoGPT-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

app = Flask(__name__)
CORS(app)

step=0
#chat_history_ids=""

# chatting 5 times with nucleus sampling & tweaking temperature
@app.route('/', methods=['POST', 'GET'])
def send():
    input_txt = request.json["key"]
    input_ids = tokenizer.encode(input_txt + tokenizer.eos_token, return_tensors="pt")
    bot_input_ids = torch.cat([chat_history_ids, input_ids], dim=-1) if step > 0 else input_ids
    chat_history_ids = model.generate(
        bot_input_ids,
        max_length=1000,
        do_sample=True,
        top_p=0.98,
        top_k=30,
        temperature=0.75,
        pad_token_id=tokenizer.eos_token_id
    )
    chat = nlp(transformers.Conversation(input_txt), pad_token_id=50256)
    res = str(chat)
    res = res[res.find("bot >> ")+6:].strip()
    data = {"response":res}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
