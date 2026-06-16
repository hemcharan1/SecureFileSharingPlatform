import { useState } from "react";
import API from "../api/api";

function SearchBar() {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchFiles = async (value) => {

    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    const token =
      localStorage.getItem("token");

    const response =
      await API.get(
        `/search?query=${value}`,
        {
          headers: {
            Authorization:
            `Bearer ${token}`
          }
        }
      );

    setResults(response.data);
  };

  return (
    <div>

      <input
        type="text"
        placeholder="🔍 Search files..."
        value={query}
        onChange={(e) =>
          searchFiles(e.target.value)
        }
      />

      {results.length > 0 && (

        <div className="search-results">

          {results.map(file => (

            <div
              key={file.id}
            >
              📄 {file.filename}
            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default SearchBar;