import React, { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md hover:bg-gray-700/20 transition-colors"
      aria-label={copied ? "Copied" : "Copy message"}
    >
      {copied ? <Check className="h-4 w-4 text-[#9181F4]" /> : <Copy className="h-4 w-4 text-gray-400" />}
    </button>
  );
};

export default CopyButton;
