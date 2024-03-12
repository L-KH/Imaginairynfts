import Image from "next/image";
import { useAccount } from 'wagmi'
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const WalletConnecting = ({className,BtnClassName}:{className?:string, BtnClassName?:string}) => {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal();
  return (
    <>
      {!Boolean(address) && 
      <>
        <div className={className ?? `flex flex-row gap-4 justify-center`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            loading="lazy"
            data-src={"/static/img/icon/yellowInfo.svg"}
            className={"lazyload"}
            src={"/static/img/icon/yellowInfo.svg"}
            alt={"warning icon to connect wallet"}
            width={25}
            height={25}
          />
          <div className={'text-ellipsis font-serif '} style={{ color: "#FF9D00" }}>
            Please connect your wallet first
          </div>
        </div>

        <div className={BtnClassName ?? `flex justify-center`}>
          <button className="btn btn-primary rounded-none mt-5 hover:bg-transparent shadow-3xl border border-primary text-xs" onClick={openConnectModal}>Connet Wallet</button>
        </div>
      </>
      }
    </>
      
  );
};

