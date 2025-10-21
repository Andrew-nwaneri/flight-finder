

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

import OpenAI from "openai";

export const getIataCode = async (city) => {
  const system_prompt = "Act as an air travel information system. Given a city name, find its primary International Air Transport Association (IATA) airport code (3 letters). Respond ONLY with the 3-letter code. If multiple major airports exist (e.g., London), use the city code (e.g., LON). If no code is found, respond with 'NOT_FOUND'."
  const client = new OpenAI({apiKey: import.meta.env.VITE_openAiKey, dangerouslyAllowBrowser: true}); 
  let conversation = [{role: "developer", content: system_prompt}, {role: 'user', content: city}];

  try{
    response = await client.responses.create({
    model: "gpt-5-nano",
    reasoning: { effort: "low" }, input: conversation});
    if (!response.ok){
      const errorTxt = await response.text();
      console.error(`Error ${errorTxt.status}: ${errorTxt}`)
      throw new Error(`Error ${response.status}: ${errorTxt}`);

    }

    return await response.output_text[0].content[0].text;
  }catch (err) {
      console.error('Error communicating with AI server', err.message);
      throw err;
    }
   
}

export const bookFlight = async (flight, travelers) => {
  const bookUrl = 'test.api.amadeus.com/v1/booking/flight-orders';
  const parameters = {
    "data": {
      "type": "flight-order",
      "flightOffers": [flight],
      "travelers": [travelers]
    }
  };
  try{response = await fetch(bookUrl, {method: "POST", headers: {Authorization: `Bearer ${token.access_token}` }, body: JSON.stringify(parameters)});
  }catch (err) {
    console.error(`Couldn't book flight: ${err.message}`)
    throw err
  }
  if (!response.ok){
    const bookingError = await response.text()
    throw new Error(`${bookingError}: ${bookingError.status}`);
  
  }
  return await response.json();
}
