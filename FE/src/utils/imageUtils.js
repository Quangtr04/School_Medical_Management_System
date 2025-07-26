/**
 * Utility functions for handling image URLs in the application
 */
import api from "../configs/config-axios";

/**
 * Formats an image URL by ensuring it has the correct base URL
 * Handles various formats including JSON strings, arrays, and relative paths
 *
 * @param {string} url - The image URL to format
 * @returns {string} - The formatted URL
 */
export const getImageUrl = (url) => {
  if (!url) return "";

  console.log("Processing URL:", url);

  // If the URL already starts with http or https, return it as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    console.log("URL is already absolute, returning as is");
    return url;
  }

  // Try to parse as JSON if it looks like a JSON string
  if (
    (url.startsWith("[") && url.endsWith("]")) ||
    (url.startsWith("{") && url.endsWith("}"))
  ) {
    try {
      console.log("Attempting to parse as JSON:", url);
      const parsed = JSON.parse(url);

      // Handle array format
      if (Array.isArray(parsed)) {
        if (parsed.length > 0) {
          console.log(
            "Successfully parsed as JSON array, using first item:",
            parsed[0]
          );
          return parsed[0];
        }
      }
      // Handle object format with url or path property
      else if (typeof parsed === "object") {
        const imageUrl = parsed.url || parsed.path || parsed.image_url;
        if (imageUrl) {
          console.log(
            "Successfully parsed as JSON object, using property:",
            imageUrl
          );
          return getImageUrl(imageUrl); // Recursively process the extracted URL
        }
      }
    } catch (e) {
      console.error("Failed to parse as JSON:", e);
    }
  }

  // Get base URL from axios config
  const baseURL = api.defaults.baseURL || "";
  const apiServerURL = baseURL.replace("/api", "");

  // Construct the full URL
  const fullUrl = `${apiServerURL}${url.startsWith("/") ? "" : "/"}${url}`;
  console.log("Constructed full URL:", fullUrl);

  return fullUrl;
};

/**
 * Extracts image URL from various formats
 * This is a more direct approach for use in components
 *
 * @param {string} urlString - The raw URL string that might be in various formats
 * @param {boolean} returnAllUrls - If true, returns all URLs in an array when applicable
 * @returns {string|string[]} - The extracted image URL or array of URLs
 */
export const extractImageUrl = (urlString, returnAllUrls = false) => {
  if (!urlString) return returnAllUrls ? [] : "";

  // Direct URL case
  if (urlString.startsWith("http://") || urlString.startsWith("https://")) {
    return returnAllUrls ? [urlString] : urlString;
  }

  // JSON array format: ["http://..."]
  if (urlString.startsWith("[") && urlString.endsWith("]")) {
    try {
      const parsed = JSON.parse(urlString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (returnAllUrls) {
          return parsed; // Return all URLs in the array
        } else {
          return parsed[0]; // Return just the first URL
        }
      }
    } catch (e) {
      console.error("Error parsing JSON array URL:", e);
    }
  }

  // Try to extract URL from a string containing a URL
  const urlMatch = urlString.match(/(https?:\/\/[^"'\s]+)/i);
  if (urlMatch && urlMatch[1]) {
    return returnAllUrls ? [urlMatch[1]] : urlMatch[1];
  }

  // If all else fails, use the getImageUrl function
  const result = getImageUrl(urlString);
  return returnAllUrls ? [result] : result;
};

/**
 * Extracts all image URLs from a string that might contain multiple URLs
 *
 * @param {string} urlString - The raw URL string that might contain multiple URLs
 * @returns {string[]} - Array of extracted image URLs
 */
export const extractAllImageUrls = (urlString) => {
  return extractImageUrl(urlString, true);
};
