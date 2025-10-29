let token = null;
let tokenPromise = null; 

async function getAccessToken() {
  // If we already have a valid token, return it
  if (token && Date.now() < token.expires_at) {
    return token.access_token;
  }

  // If a refresh is already happening, wait for it
  if (tokenPromise) {
    await tokenPromise;
    return token.access_token;
  }

  // Otherwise, refresh the token
  tokenPromise = (async () => {
    console.log('🔄 Refreshing Amadeus token...');
    const response = await fetch(import.meta.env.VITE_oauthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${import.meta.env.VITE_clientID}&client_secret=${import.meta.env.VITE_clientSecret}`,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OAuth failed: ${response.status} - ${errText}`);
    }
    const data = await response.json();
    token = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000, // typically 3600 sec
    };
    console.log('✅ Token refreshed successfully');

    tokenPromise = null; // reset promise
  })();

  await tokenPromise;
  return token.access_token;
}

async function getIataCode({city}){
  const accessToken = await getAccessToken();
  const apiUrl = `https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${encodeURIComponent(city)}`
  try{
    const response = await fetch(apiUrl, {headers: {Authorization: `Bearer ${accessToken}`}});
    
    if (response.status === 401) {
      console.warn('⚠️ Token expired mid-request. Retrying...');
      const newToken = await getAccessToken(); // refresh and retry once
      const retryResponse = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      const retryData = await retryResponse.json();
      const retryResult = retryData.data.map((loc) => ({
      city: loc.name,
      iata: loc.iataCode,
    }))
    return retryResult;}
    
    if (!response.ok){
      const errTxt = response.text();
      console.error(`${response.status}: ${errTxt}`);
      throw new Error(errTxt);
    }
    const data = await response.json();
    const result = data.data.map((loc) => ({
      city: loc.name,
      iata: loc.iataCode,
    }))
    return result;
  }catch (err) {
      console.error('Network error', err.message);
      throw err;
    }  
}

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
    const accessToken = await getAccessToken();
    var iataOrigin;
    var iataDestination;
    if (origin.length > 3){
      console.log('Fetching ORIGIN IATA');
      iataOrigin = await getIataCode({city: origin});
      if (iataOrigin.length < 1){
        iataOrigin = [{iata: origin.toUpperCase()}];
      }
      console.log('origin city:', iataOrigin)
    }else{
      iataOrigin = [{iata: origin.toUpperCase()}];
    }
    if (destination.length > 3){
      console.log('Fetching DESTINATION IATA');
      iataDestination = await getIataCode({city: destination});
      if (iataDestination.length < 1){
        iataDestination = [{iata: destination.toUpperCase()}];
      }
      console.log('Destination city:', iataDestination)

    }else{
      iataDestination = [{iata: destination.toUpperCase()}];
    }

    const params = new URLSearchParams();

    if (iataOrigin) params.append("originLocationCode", iataOrigin[0].iata);
    if (iataDestination) params.append("destinationLocationCode", iataDestination[0].iata);
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
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      console.warn('⚠️ Token expired mid-request. Retrying...');
      const newToken = await getAccessToken(); // refresh and retry once
      const retryResponse = await fetch(flightsUrl, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      const retryData = await retryResponse.json();
      return retryData;
    }

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




export const bookFlight = async (flight, travelers) => {
  const bookUrl = 'https://test.api.amadeus.com/v1/booking/flight-orders';
  const accessToken = await getAccessToken();
  const parameters = {
    data: {
      type: "flight-order",
      flightOffers: [flight],
      travelers: [travelers]
    }
  };
  try{
    const response = await fetch(bookUrl, {method: "POST", headers: {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(parameters) });
      if (!response.ok){
    const bookingError = await response.text()
    throw new Error(`${response.status}: ${bookingError}`);  } else {
      return await response.json();
    }
  }catch (err) {
    console.error(`Couldn't book flight: ${err.message}`)
    throw err
  }
}
