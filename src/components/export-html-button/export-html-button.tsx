import { Button } from "../ui/button";
// import { useState } from "react";

export default function ExportHtmlButton({ html }: { html: string }) {
  const handleExport = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported-site.html"; // 设置下载文件名
    a.click();
    URL.revokeObjectURL(url); // 清理内存
  };

  return (
    <Button variant="default" size="sm" onClick={handleExport}>
      Download HTML
    </Button>
  );
}
