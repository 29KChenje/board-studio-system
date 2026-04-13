import { useState } from "react";

export const useAsync = (initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (callback) => {
    try {
      setLoading(true);
      setError("");
      const result = await callback();
      setData(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unexpected error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, setData, run };
};
