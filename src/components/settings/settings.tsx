// import classNames from "classnames";
import { PiGearSixFill } from "react-icons/pi";
import { useEffect } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// @ts-expect-error not needed
import { MODELS } from "./../../../utils/providers";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { useMemo } from "react";
import { useLocalStorage } from "react-use";

function Settings({
  open,
  onClose,
  model,
  onModelChange,
}: {
  open: boolean;
   onClose: (open: boolean) => void; // 添加此行
  model: string;
  onModelChange: (model: string) => void;
}) {
  const [apiKey, setApiKey] = useLocalStorage("bailian_api_key", "");
  useEffect(() => {
    setApiKey(""); // 设置为空字符串即清空输入框
  }, []);
  const handleChangeModel = (newModel: string) => {
    onModelChange(newModel);
  };

  return (
    <div className="">
      <Popover open={open} onOpenChange={onClose}>
        <PopoverTrigger asChild>
          <Button variant="gray" size="sm">
            <PiGearSixFill className="size-4" />
            Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="!rounded-2xl p-0 !w-96 overflow-hidden !bg-neutral-900"
          align="center"
        >
          <header className="flex items-center text-sm px-4 py-3 border-b gap-2 bg-neutral-950 border-neutral-800 font-semibold text-neutral-200">
            Customize Settings
          </header>
          <main className="px-4 pt-5 pb-6 space-y-5">
            {/* 模型选择 */}
            <label className="block">
              <p className="text-neutral-300 text-sm mb-2.5">Choose a Model</p>
              <Select defaultValue={model} onValueChange={handleChangeModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Models</SelectLabel>
                    {MODELS.map(
                      ({ value, label, isNew = false }: { value: string; label: string; isNew?: boolean }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                          {isNew && (
                            <span className="text-xs bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-full px-1.5 py-0.5 ml-2">
                              New
                            </span>
                          )}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>

            {/* API Key 输入 */}
            <label className="block">
              <p className="text-neutral-300 text-sm mb-2">Bailian API Key</p>
              <input
                type="text"
                value={apiKey || ""}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border border-gray-700 rounded-md px-3 py-2 bg-neutral-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Bailian API Key"
              />
              <p className="text-xs text-neutral-400 mt-1">
                This will be used for calling Bailian platform.
              </p>
            </label>
          </main>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default Settings;
