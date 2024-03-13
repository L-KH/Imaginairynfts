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
        return "Failed to generate prompt: Unexpected response format.";
      }
  
      const result = await response.json();
      //console.log(result)
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
  
//-------------------------------------------------------
export const createImageWithEdenAI = async (prompt: string): Promise<string | null> => {
  const options = {
    method: "POST",
    url: "https://api.edenai.run/v2/image/generation",
    headers: {
      authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGU2NjYzNmEtYWNlNi00NDUwLWJkMTUtNmNjYTEzYWY0NWE1IiwidHlwZSI6ImFwaV90b2tlbiJ9.nDVeryJmZVNa83HPR7wg32-mh2HDC3wytFJWbCckm84",
    },
    data: {
      providers: "replicate",
      text: prompt,
      resolution: "512x512",
      fallback_providers: "",
    },
  };

  try {
    const response = await axios.request(options);
    // Dynamically get the first provider key
    const providerKey = Object.keys(response.data)[0];
    // Check for the success status and retrieve the URL from the first item in the items array
    if (response.data[providerKey].status === 'success' && response.data[providerKey].items && response.data[providerKey].items.length > 0) {
      const imageUrl = response.data[providerKey].items[0].image_resource_url; // Use the correct field based on the response structure
      return imageUrl;
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    console.error('Error calling EdenAI:', error);
    return null;
  }
};
//-------------------------------------------------------
export const createImage = async (apiUrl: string, prompt: string) => {
  const seed = generateRandomSeed(0, 1000)
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