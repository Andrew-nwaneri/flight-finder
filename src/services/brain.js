export const findFlights = async ({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  infants,
  travelClass,
  currencyCode,
  nonStop,
  maxPrice,
  max}
) => {
  try {
    const oauthResponse = await fetch(import.meta.env.VITE_oauthUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${import.meta.env.VITE_clientID}&client_secret=${import.meta.env.VITE_clientSecret}`,
    });

    if (!oauthResponse.ok) throw new Error(`OAuth failed: ${oauthResponse.status}`);

    const token = await oauthResponse.json();

    const params = new URLSearchParams();

    if (origin) params.append("originLocationCode", origin);
    if (destination) params.append("destinationLocationCode", destination);
    if (departureDate) params.append("departureDate", departureDate);
    if (returnDate) params.append("returnDate", returnDate);
    if (adults) params.append("adults", adults);
    if (children) params.append("children", children);
    if (infants) params.append("infants", infants);
    if (travelClass) params.append("travelClass", travelClass);
    if (currencyCode) params.append("currencyCode", currencyCode);
    if (nonStop !== undefined) params.append("nonStop", nonStop);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (max) params.append("max", max);

    const flightsUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`;
    console.log("Flight search URL:", flightsUrl);

    const response = await fetch(flightsUrl, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Flight search failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data;

  } catch (err) {
    console.error("Error in findFlights:", err.message);
    throw err;
  }
};



