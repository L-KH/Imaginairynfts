import { OPENAI_API_KEY } from '../constants/config';
import {generateRandomSeed} from '@/utils/randomUtils'
import axios from 'axios'
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });
  

    




export const getMagicPrompt = async (name: string) => {

  
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Gustavosta/MagicPrompt-Stable-Diffusion",
        {
          headers: { Authorization: "Bearer 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" },
          method: "POST",
          body: JSON.stringify({ inputs: name }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`API call failed with status code ${response.status}`);
      }
  
      const result = await response.json();
  
      if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
      } else if (result?.generated_text) {
        return result.generated_text;
      } else {
        return "Failed to generate prompt: Unexpected response format.";
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      return "Failed to generate prompt due to an error.";
    }
  };
  

// newwwwwwwwwwwwwwwwwwwwwwwwww
export const createImageWithDALLE = async (prompt: string) => {
    try {
  
      // Example using OpenAI's API, replace with your DALL-E API call if not using OpenAI
      const response = await openai.images.generate({ // Make sure this method exists; this is hypothetical
        model: "dall-e-2",
  
        prompt: prompt,
        n: 1, // Number of images to generate
        size: '512x512' // Image size, adjust as needed
      });
  
      if (response.data && response.data.length > 0) {
        const imageUrl = response.data[0].url;
        return response.data[0]; // Return the image data
      }
    } catch (error) {
      console.error(error);
    }
  };


  export const createImageWithStableDiffusion = async (prompt: string) => {
  
    try {
      const API_KEY = "d30ec85c-a6a4-4aeb-87f6-3eaf6ca794d8"; // Replace with your actual DeepAI API key
      const response = await axios.post("https://api.deepai.org/api/text2img", {
        text: prompt,
      }, {
        headers: { 'Api-Key': API_KEY },
      });
  
      if (response.data && response.data.output_url) {
        
        return response.data.output_url
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error(error);
    } 
  };

export const createImage = async (apiUrl: string, seed: string) => {
    try {
      const response = await axios({
        url: apiUrl,
        method: "POST",
        headers: { Authorization: `Bearer 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` },
        data: JSON.stringify({
          inputs: `${prompt} [seed:${seed}]`,
          options: { wait_for_model: true },
        }),
        responseType: "arraybuffer",
      });
  
      const type = response.headers["content-type"];
    const data = response.data;
    const base64data = Buffer.from(data).toString("base64");
    const img = `data:${type};base64,` + base64data; // <-- This is so we can render it on the page
    return {image: img, data: data}
    } catch (error) {
      console.error(error);
      
  }
}