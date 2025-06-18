import { useLocalStorage } from "react-use";
import { defaultHTML } from "../../../utils/consts";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCheck } from "lucide-react";

function ProModal({
  open,
  html,
  onClose,
}: {
  open: boolean;
  html: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [, setStorage] = useLocalStorage("html_content");

  const handleProClick = () => {
    if (html !== defaultHTML) {
      setStorage(html);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg lg:!p-8 !rounded-3xl !bg-white !border-neutral-100">
        <main className="flex flex-col items-start text-left relative pt-2">
          <div className="flex items-center justify-start -space-x-4 mb-5">
            <div className="size-14 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-3xl opacity-50">
              🚀
            </div>
            <div className="size-16 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-4xl z-2">
              🤩
            </div>
            <div className="size-14 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-3xl opacity-50">
              🥳
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-950">
            Only 9$ for unlimited access!
          </p>
          <p className="text-neutral-500 text-base mt-2 max-w-sm">
            It seems like you have reached the monthly free limit of DeepSite.
          </p>
          <hr className="bg-neutral-200 w-full max-w-[150px] my-6" />
          <p className="text-lg mt-3 text-neutral-900 font-semibold">
            Upgrade to a <ProTag className="mx-1" /> Account, and unlock:
          </p>
          <ul className="mt-3 space-y-1 text-neutral-500">
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              DeepSite unlimited access to all Inference Providers
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              Get highest priority and 8x more quota on Spaces ZeroGPU
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              Activate Dataset Viewer on private datasets
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              Get exclusive early access to new features and updates
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              Get free credits across all Inference Providers
            </li>
            <li className="text-sm text-neutral-500 space-x-2 flex items-center justify-start gap-2 mt-3">
              ... and much more!
            </li>
          </ul>
          <Button
            variant="gray"
            size="lg"
            className="w-full !text-base !h-11 mt-8"
            onClick={handleProClick}
          >
            Subscribe to PRO ($9/month)
          </Button>
        </main>
      </DialogContent>
    </Dialog>
  );
}
const ProTag = ({ className }: { className?: string }) => (
  <span
    className={`${className} bg-linear-to-br shadow-green-500/10 dark:shadow-green-500/20 inline-block -skew-x-12 border border-gray-200 from-pink-300 via-green-200 to-yellow-200 text-xs font-bold text-black shadow-lg rounded-md px-2.5 py-0.5`}
  >
    PRO
  </span>
);
export default ProModal;
