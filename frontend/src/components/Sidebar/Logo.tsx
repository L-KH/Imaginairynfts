import logo from '../assets/logo-bg1.png'
import Image from "next/legacy/image";

export function Logo(props: any) {
  return (
    <div {...props}>
      <div className="py-10 m-auto flex flex-col items-center gap-1 justify-center">
        {/* <div className="flex">
          <TbPacman className="h-14 w-14 text-secondary"></TbPacman>
        </div> */}
        <div className="w-24 h-24 relative ">
          <Image
            src={logo}
            alt="ImaginAIryNFTs Logo"
            layout="fill"
            objectFit="contain"
            className=" mb-3 rounded-full shadow-lg "
          />

        </div>
        <div className="flex nav__brand">
          <h1>ImaginAIryNFTs</h1>
        </div>
      </div>
    </div>
  )
}
