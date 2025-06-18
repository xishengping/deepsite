import classNames from "classnames";
import { useState } from "react";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

function ExportHtmlButton({
  html,
}: {
  html: string;
}) {
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported-site.html"; // 设置下载文件名
    a.click();
    URL.revokeObjectURL(url); // 清理内存
    setOpen(false);
  };

  return (
    <div className={classNames("max-md:hidden")}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="underline hover:text-white cursor-pointer text-xs lg:text-sm text-gray-300"
            onClick={() => setOpen(!open)}
            type="button"
          >
            Export HTML
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="!rounded-2xl p-0 overflow-hidden !bg-neutral-900"
          align="end"
        >
          <header
              className="flex items-center text-sm px-4 py-3 border-b gap-2 bg-neutral-950 border-neutral-800 font-semibold text-neutral-200">
            <span
                className="text-xs bg-pink-500 text-white rounded-full pl-1.5 pr-2.5 py-0.5 flex items-center justify-start gap-1.5">
              <span>📁</span>
              Export HTML
            </span>
            <span className="mx-1.5 text-gray-600">|</span>
          </header>
          <main className="px-4 pt-3 pb-4 space-y-3">
            <p className="text-sm text-neutral-300 bg-neutral-300/15 border border-neutral-300/15 rounded-md px-3 py-2">
              Export your current site as an HTML file and download it to your local machine.
            </p>
            <div className="pt-2 text-right">
              <Button
                size="sm"
                variant="default"
                onClick={handleExport}
              >
                Export HTML
              </Button>
            </div>
          </main>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ExportHtmlButton;
