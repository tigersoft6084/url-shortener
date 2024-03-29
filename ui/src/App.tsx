import React, { useState } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function App() {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setIsValid(isValidUrl(event.target.value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: url }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortenedUrl(data.shortUrl);
      } else {
        console.error(`Error shortening URL ${response.status}: ${data}`);

        if (data.error) {
          alert(`Error shortening URL: ${data.error}`);
        } else {
          alert("Unknown error shortening URL");
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      alert(`Network error: ${error}`);
    } finally {
      setIsLoading(false);
      setUrl("");
    }
  };

  return (
    <div className="mx-auto max-w-[30rem]">
      <header className="mt-36 text-center text-lg font-semibold leading-8 text-zinc-800">
        Enter the URL to shorten
      </header>

      <form onSubmit={handleSubmit}>
        <div className="mt-10 bg-white flex flex-col items-center relative">
          {url !== "" && !isValid && (
            <strong className="text-center text-white text-sm leading-6 absolute -translate-y-full border border-solid border-[#a52f2f] bg-[#dd5e5e] px-3 py rounded-md">
              Invalid URL!
            </strong>
          )}
          <input
            id="target-url"
            className={[
              "mt-2 w-full block rounded-lg text-zinc-900 sm:text-sm sm:leading-6",
              "border border-zinc-400 focus:border-zinc-500 outline-none focus:ring-1",
              "py-2 px-3",
              "disabled:bg-[#f0f0f0]",
              url !== "" && !isValid ? "ring-red-500 ring-1" : "",
            ].join(" ")}
            placeholder="Enter your long URL"
            type="text"
            value={url}
            onChange={handleUrlChange}
            disabled={isLoading}
          />

          <button
            id="shorten-button"
            className={[
              "disabled:bg-slate-400 mt-3 w-[10rem]",
              "rounded-lg bg-zinc-900 hover:bg-zinc-700 py-2 px-3",
              "text-sm font-semibold leading-6 text-white active:enabled:text-white/80",
            ].join(" ")}
            disabled={url === "" || isLoading || !isValid}
          >
            {isLoading ? "Shortening..." : "Shorten"}
          </button>
        </div>
      </form>

      {shortenedUrl && (
        <div className="mt-12">
          <div className="text-center">Success! Here is your short URL:</div>
          <div className="rounded-[0.5rem]  border w-auto p-6 border-zinc-200 mt-2 text-center relative">
            <a
              data-testid="short-url"
              href={shortenedUrl}
              className="font-bold text-xl text-[#319264]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenedUrl}
            </a>
            <button
              data-testid="copy-button"
              onClick={() => copyToClipboard(shortenedUrl)}
              className={[
                "text-[#319264] font-bold text-xs bg-white px-2 py-1 border border-[#319264] rounded-lg active:bg-[#42a979] hover:bg-[#42a979]/30 active:text-white",
                "transition-all duration-300 ease-in-out",
                "absolute right-5 top-1/2 -translate-y-1/2",
              ].join(" ")}
            >
              {isCopied ? "Copied!" : " Copy "}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
