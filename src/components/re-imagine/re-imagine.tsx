import { useState } from "react";
import { Paintbrush } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import Loading from "../loading/loading";

export default function ReImagine({
  onRedesign,
}: {
  onRedesign: (md: string) => void;
}) {
  const [url, setUrl] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfUrlIsValid = (url: string) => {
    const urlPattern = new RegExp(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      "i"
    );
    return urlPattern.test(url);
  };

  const handleClick = async () => {
    if (!url) {
      toast.error("Please enter a URL.");
      return;
    }
    if (!checkIfUrlIsValid(url)) {
      toast.error("Please enter a valid URL.");
      return;
    }
    // Here you would typically handle the re-design logic
    setIsLoading(true);
    const request = await fetch("/api/re-design", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await request.json();
    if (response.ok) {
      setOpen(false);
      setUrl("");
      onRedesign(response.markdown);
      toast.success("DeepSite is re-designing your site! Let him cook... 🔥");
    } else {
      toast.error(response.message || "Failed to re-design the site.");
    }
    setIsLoading(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <form>
        <PopoverTrigger asChild>
          <Button
            size="iconXs"
            variant="outline"
            className="!border-neutral-600 !text-neutral-400 !hover:!border-neutral-500 hover:!text-neutral-300"
          >
            <Paintbrush className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="!rounded-2xl !p-0 !bg-white !border-neutral-100 min-w-xs text-center overflow-hidden"
        >
          <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
            <div className="flex items-center justify-center -space-x-4 mb-3">
              <div className="size-9 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                🎨
              </div>
              <div className="size-11 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-2xl z-2">
                🥳
              </div>
              <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                💎
              </div>
            </div>
            <p className="text-xl font-semibold text-neutral-950">
              Redesign your Site!
            </p>
            <p className="text-sm text-neutral-500 mt-1.5">
              Try our new Redesign feature to give your site a fresh look.
            </p>
          </header>
          <main className="space-y-4 p-6">
            <div>
              <p className="text-sm text-neutral-700 mb-2">
                Enter your website URL to get started:
              </p>
              <Input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={(e) => {
                  const inputUrl = e.target.value.trim();
                  if (!inputUrl) {
                    setUrl("");
                    return;
                  }
                  if (!checkIfUrlIsValid(inputUrl)) {
                    toast.error("Please enter a valid URL.");
                    return;
                  }
                  setUrl(inputUrl);
                }}
                className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
              />
            </div>
            <div>
              <p className="text-sm text-neutral-700 mb-2">
                Then, let's redesign it!
              </p>
              <Button
                variant="gray"
                onClick={handleClick}
                className="relative w-full"
                disabled={isLoading}
              >
                Redesign <Paintbrush className="size-4" />
                {isLoading && <Loading className="ml-2 size-4 animate-spin" />}
              </Button>
            </div>
          </main>
        </PopoverContent>
      </form>
    </Popover>
  );
}
