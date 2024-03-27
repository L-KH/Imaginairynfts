type Config = {
    [key: number]: {
        nft: {
            address: `0x${string}`;
        };
    };
};

export const addresses: Config ={
    "5": {
        "nft": {
            "address": "0x428898967a7fC5CD9B362236c0849DBf51add007"
        }
    },
    "10": {
        "nft": {
            "address": "0xb99E5534d42500eB1d5820fBA3Bb8416cCB76396"
        }
    },
    "59140": {
        "nft": {
            "address": "0x67b9d421a2F130E93c8a996A534Fe5aC55d3De70"
        }
    },
    "534353": {
        "nft": {
            "address": "0xa923E296D8b1d3125dA46d1879F8e4A63Dd77f63"
        }
    },
    "57000": {
        "nft": {
            "address": "0x842dC5BF2A70E1E5Cea8F528D9B176CeFDE54c73"
        }
    },
    "167005": {
        "nft": {
            "address": "0xb99E5534d42500eB1d5820fBA3Bb8416cCB76396"
        }
    },
    "570": {
        "nft": {
            "address": "0xb99E5534d42500eB1d5820fBA3Bb8416cCB76396"
        }
    },
    "59144": {
        "nft": {
            "address": "0xb99E5534d42500eB1d5820fBA3Bb8416cCB76396"
        }
    },
    "8453": {
        "nft": {
            "address": "0x19A4f00039Cde3ffbe29b23417FcfB9101Ae174b"
        }
    },
    "534352": {
        "nft": {
            "address": "0xb99e5534d42500eb1d5820fba3bb8416ccb76396"
        }
    }
    
}


export const OPENAI_API_KEY = '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';
type IAPIURI = {
    [key: string]: string;
};
export const apiUrlMap: IAPIURI = { 
    //'stable-diffusion-2-1': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
     'stable-diffusion-v1-5': 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
     'fast-dreambooth':'https://api-inference.huggingface.co/models/RafiulCV/fast-dreambooth',
    // 'stable-diffusion-v1-4': 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4',
    //'openjourney':'https://api-inference.huggingface.co/models/prompthero/openjourney',
    'openjourney V4':'https://api-inference.huggingface.co/models/prompthero/openjourney-v4',
    'openjourney V4.5': 'https://zhwo3qhaozxt4mw8.us-east-1.aws.endpoints.huggingface.cloud', // Replace with actual URL if different
    //'Realistic Vision':'https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V1.4',
    'anything-v5.0':'https://api-inference.huggingface.co/models/stablediffusionapi/anything-v5',
    // 'Dungeons-and-Diffusion':'https://api-inference.huggingface.co/models/0xJustin/Dungeons-and-Diffusion',
    'Pokemon Diffusers':'https://api-inference.huggingface.co/models/lambdalabs/sd-pokemon-diffusers',
    //'DALLE': 'DALLE',
    // 'STABLE_DIFFUSION_MODEL_NAME':'https://stablediffusionapi.com/api/v3/text2img',
    'EdenAI':'EdenAI',
    'DreamShaperV7':'DreamShaperV7',
    'sdxl-lightning':'sdxl-lightning'
 };