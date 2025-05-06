import { useState } from "react";

const useFetchWithProgress = () => {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const fetchJsonWithProgress = async (url: string) => {
    setLoadingDownload(true);
    setDownloadProgress(0);

    const response = await fetch(url);
    if (!response.ok) {
      setLoadingDownload(false);
      throw new Error("Failed to load JSON data");
    }

    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : null;

    if (!response.body || !response.body.getReader) {
      setLoadingDownload(false);
      setDownloadProgress(100);
      return response.json();
    }

    const reader = response.body.getReader();
    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (total) {
        setDownloadProgress((receivedLength / total) * 100);
      }
    }

    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    const resultString = new TextDecoder("utf-8").decode(chunksAll);
    setLoadingDownload(false);
    setDownloadProgress(100);
    return JSON.parse(resultString);
  };

  return { fetchJsonWithProgress, loadingDownload, downloadProgress };
};

export default useFetchWithProgress;
