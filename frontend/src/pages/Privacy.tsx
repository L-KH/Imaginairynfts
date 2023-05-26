import Layout from '@/components/Layout/Layout'
import { NextPage } from 'next'

const Privacy: NextPage = () => {
  return (
    <Layout >
      <div className="flex h-full content-center">
      <div className="flex flex-col items-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-extrabold text-secondary">Privacy Policy</h1><br></br>
        <p className="mb-12 text-lg">
        This page informs you of our policies regarding the collection, use, and disclosure of personal information we receive from users of the site.
        </p>
        <div className="  mx-auto ">
              <ul className="list-outside list-disc text-left text-lg">
              <br></br><li >
                <b>Information Collection And Use :</b> While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to your name and email address ("Personal Information").
                </li>
                <br></br><li>
                <b>Log Data:</b> Like many site operators, we collect information that your browser sends whenever you visit our Site ("Log Data"). This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages and other statistics.
                </li>
                <br></br><li>
                <b>Communications:</b> We may use your Personal Information to contact you with newsletters, marketing or promotional materials and other information.
                </li>
                <br></br><li>
                <b>Cookies:</b> Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive. Like many sites, we use "cookies" to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </li>
                <br></br><li>
                <b>Security:</b> The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.                </li>
                <br></br><li>
                <b>Changes To This Privacy Policy:</b> This Privacy Policy is effective as of (add date) and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page. We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.                </li>
                <br></br><li>
                <b>Contact Us:</b> If you have any questions about this Privacy Policy, please contact us.                </li>
              </ul>
        </div>
      </div>
      </div>
    </Layout>
  )
}

export default Privacy
