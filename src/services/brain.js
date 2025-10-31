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
  if (city.length === 3){
    return [{iata: city.toUpperCase()}];
  }
  const accessToken = await getAccessToken();
  const apiUrl = `https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${encodeURIComponent(city)}&max=1`
  try{
    let response = await fetch(apiUrl, {headers: {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'}});
    
// ... inside getIataCode ...

 if (response.status === 401) {
    console.warn('⚠️ Token expired mid-request. Retrying...');
    const newToken = await getAccessToken();
    const retryResponse = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${newToken}`, 'Content-Type': 'application/json' },
    });
    
    if (!retryResponse.ok) { 
      const retryErrTxt = await retryResponse.text();
      throw new Error(`Retry failed (${retryResponse.status}): ${retryErrTxt}`);
    }

    response = retryResponse;
 }
    
  if (!response.ok){
    const errTxt = await response.text(); // Await is missing here, see issue 3
    console.error(`${response.status}: ${errTxt}`);
    throw new Error(errTxt);
  }
  const resultData = await response.json();

  if (resultData?.data.length < 1){
    const errRslt = "The Iata Code search returned empty"
    console.error(`${response.status}: ${errRslt}`);
    alert('IATA lookup failed by returning empty: ' + errRslt);
    throw new Error(err);
  }

  const result = [{city: resultData.data[0].city, iata: resultData.data[0].iataCode}];
  return result;
  }catch (err) {
    alert('IATA lookup failed: ' + err.message);
    throw err;  
}};

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
        let iataDestination;
        let iataOrigin;
        // ... IATA code fetching ...
        iataDestination = await getIataCode({city: destination})
        iataOrigin = await getIataCode({city: origin})
        
        const params = new URLSearchParams();

        // FIX: Check that the array exists AND has elements BEFORE accessing [0]
        if (iataOrigin && iataOrigin.length > 0 && iataOrigin[0].iata) {
            params.append("originLocationCode", iataOrigin[0].iata);
        } else {
            // Use the original input as a fallback IATA code
            params.append("originLocationCode", origin.toUpperCase());
        }
        
        // FIX: Check that the array exists AND has elements BEFORE accessing [0]
        if (iataDestination && iataDestination.length > 0 && iataDestination[0].iata) {
            params.append("destinationLocationCode", iataDestination[0].iata);
        } else {
            // Use the original input as a fallback IATA code
            params.append("destinationLocationCode", destination.toUpperCase());
        }
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

    const accessToken = await getAccessToken();
    const response = await fetch(flightsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

  if (response.status === 401) {
    console.warn('⚠️ Token expired mid-request. Retrying...');
    const newToken = await getAccessToken(); // refresh and retry once
    const retryResponse = await fetch(flightsUrl, {
      headers: { Authorization: `Bearer ${newToken}` },
    });

    if (!retryResponse.ok) {
      const retryErrText = await retryResponse.text();
      throw new Error(`Flight search retry failed (${retryResponse.status}): ${retryErrText}`);
    }

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
      alert('Flight lookup failed: ' + err.message);
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
