import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

interface AxiosError {
  response?: {
    status: number;
    headers: {
      location: string;
    };
  };
  // Include any other properties you expect
  message?: string;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log(_req.body); // Log request body for debugging

  const getServiceValidate = async (): Promise<string | null> => {
    let currentUrl =
      "https://shib.ust.hk/idp/profile/cas/login?service=" +
      process.env.NEXT_PUBLIC_BASE_URL +
      "/cv";

    let ticket: string | null = null;

    try {
      console.log("Fetching:", currentUrl);

      const response = await axios.get(currentUrl, {
        maxRedirects: 0,
        withCredentials: true,
      });
      // If we get a 200 response and no other redirection
      console.log("Final Response:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 302) {
        // Capture the redirect URL from the response headers
        currentUrl = error.response.headers.location;
        console.log("Redirecting to:", currentUrl);

        // Check for the ticket in the new redirect URL
        const url = new URL(currentUrl);
        ticket = url.searchParams.get("ticket");
      } else {
        console.error("Error fetching:", error);
        throw error; // Handle other errors appropriately
      }
    }

    return ticket; // Return the found ticket or null if none found
  };

  const resServiceValidate = await getServiceValidate();
  console.log("Service Validate Response:", resServiceValidate);
  res.status(200).json({ message: resServiceValidate });
}
