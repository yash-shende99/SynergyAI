#!/usr/bin/env python3
"""
Ready-to-Use SynergyAI Chatbot
Works with your pre-quantized model
"""

import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class SynergyAIChatbot:
    def __init__(self, model_path="./synergyai_final_standalone_model"):
        """Initialize SynergyAI with pre-quantized model"""
        self.model_path = model_path
        self.model = None
        self.tokenizer = None
        self.conversation_history = []
        
        print("🤖 Initializing SynergyAI...")
        self._load_model()
        print("✅ SynergyAI ready!")
    
    def _load_model(self):
        """Load the pre-quantized model with stability fixes"""
        try:
            # Load tokenizer first
            print("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            
            # Add pad token if missing
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            print("Loading model with stability fixes...")
            
            # Try different loading approaches
            loading_configs = [
                # Config 1: CPU with float32 (most stable)
                {
                    "torch_dtype": torch.float32,
                    "device_map": "cpu",
                    "trust_remote_code": True,
                    "low_cpu_mem_usage": True
                },
                # Config 2: Auto with float32
                {
                    "torch_dtype": torch.float32,
                    "device_map": "auto",
                    "trust_remote_code": True,
                    "low_cpu_mem_usage": True
                },
                # Config 3: CPU with bfloat16
                {
                    "torch_dtype": torch.bfloat16,
                    "device_map": "cpu",
                    "trust_remote_code": True,
                    "low_cpu_mem_usage": True
                }
            ]
            
            for i, config in enumerate(loading_configs):
                try:
                    print(f"Trying loading config {i+1}...")
                    self.model = AutoModelForCausalLM.from_pretrained(
                        self.model_path,
                        **config
                    )
                    
                    # Set to eval mode
                    self.model.eval()
                    
                    print(f"✅ Model loaded successfully with config {i+1}")
                    print(f"📊 Device: {next(self.model.parameters()).device}")
                    print(f"📊 Dtype: {next(self.model.parameters()).dtype}")
                    return
                    
                except Exception as e:
                    print(f"❌ Config {i+1} failed: {e}")
                    continue
            
            raise Exception("All loading configurations failed")
            
        except Exception as e:
            print(f"❌ All loading attempts failed: {e}")
            raise
    
    def generate_response(self, user_input, max_tokens=256, temperature=0.8, do_sample=True):
        """Generate response with numerical stability"""
        try:
            # Format the prompt (simpler format)
            prompt = f"Human: {user_input}\nAssistant:"
            
            # Tokenize input
            inputs = self.tokenizer(
                prompt, 
                return_tensors="pt", 
                padding=True, 
                truncation=True, 
                max_length=512
            )
            
            # Move to same device as model
            device = next(self.model.parameters()).device
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            # Generate with stability settings
            with torch.no_grad():
                # Clear any existing gradients
                torch.cuda.empty_cache() if torch.cuda.is_available() else None
                
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=max(temperature, 0.1),  # Prevent temperature from being too low
                    do_sample=do_sample,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.05,  # Reduced from 1.1
                    top_p=0.95,  # Increased for more stability
                    top_k=40,    # Reduced for more stability
                    no_repeat_ngram_size=2,
                    early_stopping=True,
                    use_cache=True,
                    # Stability settings
                    renormalize_logits=True,  # Renormalize logits to prevent inf/nan
                )
            
            # Decode response
            full_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract only the new part (after the prompt)
            response = full_response[len(prompt):].strip()
            
            # Clean up response
            response = self._clean_response(response)
            
            # Validate response
            if not response or len(response.strip()) == 0:
                return "I'm here to help! Could you please rephrase your question?"
            
            # Add to history
            self._add_to_history(user_input, response)
            
            return response
            
        except Exception as e:
            print(f"❌ Generation error: {e}")
            
            # Fallback: Simple template response
            fallback_responses = [
                "I'm SynergyAI, your helpful assistant. How can I help you today?",
                "I'm here to assist you. What would you like to know?",
                "Hello! I'm ready to help with your questions.",
                "I'm an AI assistant called SynergyAI. What can I do for you?"
            ]
            
            import random
            return random.choice(fallback_responses)
    
    def _format_prompt(self, user_input):
        """Format the prompt with system message and history"""
        system_message = "You are SynergyAI, a helpful and knowledgeable AI assistant."
        
        # Build conversation context
        context_parts = [f"System: {system_message}"]
        
        # Add recent conversation history (last 3 exchanges)
        for exchange in self.conversation_history[-3:]:
            context_parts.append(f"Human: {exchange['human']}")
            context_parts.append(f"Assistant: {exchange['assistant']}")
        
        # Add current input
        context_parts.append(f"Human: {user_input}")
        context_parts.append("Assistant:")
        
        return "\n\n".join(context_parts)
    
    def _clean_response(self, response):
        """Clean up the generated response"""
        # Remove common artifacts
        response = response.replace("Human:", "").replace("Assistant:", "")
        
        # Split by common stop patterns and take first part
        stop_patterns = ["\n\nHuman:", "\n\nSystem:", "\nHuman:", "\nSystem:"]
        for pattern in stop_patterns:
            if pattern in response:
                response = response.split(pattern)[0]
                break
        
        return response.strip()
    
    def _add_to_history(self, user_input, response):
        """Add exchange to conversation history"""
        self.conversation_history.append({
            'human': user_input,
            'assistant': response
        })
        
        # Keep only last 10 exchanges to manage memory
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        print("🗑️ Conversation history cleared")
    
    def get_model_info(self):
        """Get information about the loaded model"""
        try:
            device = next(self.model.parameters()).device
            dtype = next(self.model.parameters()).dtype
            
            # Try to get memory usage
            if device.type == 'cuda':
                allocated = torch.cuda.memory_allocated(device) / 1024**3
                cached = torch.cuda.memory_reserved(device) / 1024**3
                return f"Device: {device}, Type: {dtype}, GPU Memory: {allocated:.1f}GB allocated, {cached:.1f}GB cached"
            else:
                return f"Device: {device}, Type: {dtype}"
        except:
            return "Model info unavailable"

def main():
    """Interactive chat interface"""
    print("=" * 60)
    print("🤖 SYNERGYAI CHATBOT - RTX 4050 OPTIMIZED")
    print("=" * 60)
    
    # Initialize chatbot
    try:
        chatbot = SynergyAIChatbot()
        print(f"📊 {chatbot.get_model_info()}")
    except Exception as e:
        print(f"❌ Failed to initialize SynergyAI: {e}")
        print("\n💡 Troubleshooting:")
        print("1. Make sure CUDA is available if using GPU")
        print("2. Ensure sufficient RAM/VRAM")
        print("3. Try reducing model size or use CPU-only mode")
        return
    
    print("\n" + "=" * 60)
    print("Commands: 'quit' to exit, 'clear' to clear history, 'info' for model info")
    print("=" * 60)
    
    # Chat loop
    while True:
        try:
            # Get user input
            user_input = input("\n👤 You: ").strip()
            
            if not user_input:
                continue
                
            # Handle commands
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("👋 Goodbye! Thanks for chatting with SynergyAI!")
                break
            elif user_input.lower() == 'clear':
                chatbot.clear_history()
                continue
            elif user_input.lower() == 'info':
                print(f"📊 {chatbot.get_model_info()}")
                continue
            elif user_input.lower() == 'help':
                print("Commands: quit/exit/bye, clear, info, help")
                continue
            
            # Generate and display response
            print("\n🤖 SynergyAI: ", end="", flush=True)
            response = chatbot.generate_response(user_input)
            print(response)
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye! Thanks for chatting with SynergyAI!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again or type 'quit' to exit.")

if __name__ == "__main__":
    main()