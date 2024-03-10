import { IconFair, IconSuccess } from "@/components/icons"
import styles from "@/components/assets/styles/css/mintPage.module.css";
import { useAccount } from "wagmi";




export const TransactionSuccess = ({
  title,
  describe,
  txid,
}: {
  title?: string;
  describe?: string;
  txid?: string;
}) => {
  const account = useAccount();
  const jumpToExplorer = (txid:string)=>{
    window.open(`${account.chain?.blockExplorers?.default.url}tx/${txid}`, '_blank');
  }
  return (
    <div className="w-full  ">
      <div className="w-full  border flex flex-wrap  items-center py-4 justify-center">
        <div className="mt-5 animate-pulse flex justify-center flex-wrap w-full">
          <IconSuccess />
        </div>
        <div className="w-2/3 my-4 flex flex-wrap justify-center">
          <div className="w-full text-center font-bold">{title}</div>
          <p className="w-full text-center mt-3 ">{describe}</p>
        </div>
        {txid && <div className="my-5 w-full flex flex-wrap justify-center">
          <button
            className={`mt-14 md:mt-0 bg-transparent    text-blue-600 rounded-none min-h-0 h-10 px-5 pt-3.5 pb-3.5 w-full ${styles.add_remove_liquidity_btn}`}
            onClick={() => jumpToExplorer((txid + '?format=0x') || "")}
          >
            View on Block Explorer
          </button>
        </div>}
      </div>
    </div>
  );
};

export const TransactionFail = ({ msg }: { msg?: string }) => {
  return (
    <div className="w-full   ">
      <div className="w-full flex flex-col border items-center py-4 justify-center">
        <div className="mt-5 animate-pulse flex justify-center flex-wrap w-full">
          <IconFair />
        </div>
        <div className="w-2/3 my-4 flex flex-col justify-center">
          <p className="w-full text-red-500 text-center mt-3 ">
            Transaction failed
          </p>
        </div>
        {msg && (
          <div className="my-5 w-full flex justify-center px-4">
            <div className="w-full text-yellow-600 overflow-hidden h-auto text-center mt-3 break-words whitespace-break-spaces">{msg}</div>
          </div>
        )}
      </div>
    </div>
  );
};
