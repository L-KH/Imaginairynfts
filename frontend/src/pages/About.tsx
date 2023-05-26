import Layout from '@/components/Layout/Layout'
import { NextPage } from 'next'

const About: NextPage = () => {
  return (
    <Layout >
      <div className="flex h-full content-center">
      <div className="flex flex-col items-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-extrabold text-secondary">About ImaginAIry NFTs</h1><br></br>
        <p className="mb-12 text-lg">
        ImaginAIry NFTs (Revolutionizing Digital Art through AI) is a groundbreaking platform that leverages the power of artificial intelligence to help users create personalized, unique digital art pieces and mint them as non-fungible tokens (NFTs). By combining advanced AI technology with user-driven creativity, we strive to offer an unparalleled experience for art enthusiasts, collectors, and digital creators alike.
          </p>
        
        
        <div className="  mx-auto ">
        <h2 className="text-2xl font-bold text-primary mb-2">Our Vision: "Your Prompt, Your Art, Your NFT"</h2>
              <p className="mb-12 text-lg">
              At the core of ImaginAIry NFTs is the belief that everyone should have the opportunity to express their creativity and turn their ideas into valuable digital assets. The concept of "your prompt, your art, your NFT" encapsulates our commitment to providing users with full control over the creative process, from ideation to minting.
              </p>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">The Creative Process</h2>
              <p className="mb-12 text-lg">
              Our platform empowers users to transform their ideas into reality through a simple, user-friendly interface. Users choose a title and prompt, which serves as the foundation for their AI-generated artwork. The AI model then crafts a unique and personalized piece based on these inputs. If the initial result doesn't fully satisfy the user, they can regenerate the artwork using a different random seed until they discover their perfect masterpiece.
              </p>
              <p className="mb-12 text-lg">
              Once satisfied with their creation, users can mint their custom digital art as an NFT for a nominal price of 0.001 ETH. This process establishes their ownership of the one-of-a-kind digital asset and adds it to their growing collection of unique, AI-generated artworks.
              </p>
              <p className="mb-12 text-lg">
              Embark on a journey of limitless creative possibilities with ImaginAIry NFTs. Together, we can revolutionize the world of digital art and NFTs, empowering creators to unleash their imagination and bring their ideas to life. Join us today and be a part of the future of art.
              </p>
        </div>
      </div>
    </Layout>
  )
}

export default About
