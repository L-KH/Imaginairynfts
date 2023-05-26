import Layout from '@/components/Layout/Layout'
import { NextPage } from 'next'

const Terms: NextPage = () => {
  return (
    <Layout >
      <div className="flex h-full content-center">
      <div className="flex flex-col items-center w-full flex-1 px-20 text-center mb-12">
        <h1 className="text-4xl font-extrabold text-secondary">Terms of Service</h1>
        <p className="mb-12 text-lg">
        Welcome to ImaginAIry NFTs. We appreciate your interest and engagement with our platform. Please ensure you read these Terms of Service ("Terms", "Terms of Service") thoroughly and with careful attention before using the ImaginAIry NFTs platform, accessible via our website.</p>
        <div className="  mx-auto ">
              <ul className="list-outside list-disc text-left text-xl">
                <li >
                <b>Agreement to Terms</b>
                </li>
                <p className='text-sm mb-4'>
                Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.                </p>
                <li >
                <b>Content</b>
                </li>
                <p className='text-sm mb-4'>
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.</p>
                <li >
                <b>Links To Other Web Sites</b>
                </li>
                <p className='text-sm mb-4'>
                Our Service may contain links to third-party web sites or services that are not owned or controlled by ImaginAIry NFTs.
                ImaginAIry NFTs has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that ImaginAIry NFTs shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
                </p>
                <li >
                <b>Changes</b>
                </li>
                <p className='text-sm mb-4'>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.                
                </p>
                <li >
                <b>Termination</b>
                </li>
                <p className='text-sm mb-4'>
                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms.                </p>
                
              </ul>
        </div>

        

      </div>
      </div>
    </Layout>
  )
}

export default Terms
