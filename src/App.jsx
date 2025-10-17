import { useState } from 'react';
import { findFlights } from './services/brain';
import Flight from './components/flight';
import { format } from 'date-fns';
import {
  PlaneTakeoff,
} from "lucide-react";
import './App.css';

function App() {
  const currencyOptions = [
    "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "ZAR", "NGN",
    "CNY", "INR", "BRL", "MXN", "SGD", "HKD", "KRW", "SEK", "NOK", "DKK",
  ];

  const [origin, setOrigin] = useState("PAR");
  const [destination, setDestination] = useState("LON");
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [nonStop, setNonStop] = useState(false);
  const [adults, setAdults] = useState(1);
  const [travelClass, setTravelClass] = useState('');
  const [flightData, setFlightData] = useState({});
  const [status, setStatus] = useState('Search Flights');
  const [isExpanded, setIsExpanded] = useState(false);

  const max = 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) {
      setStatus('Please fill in Origin, Destination, and Departure Date.');
      return;
    }
    try {
      setStatus('Searching...');
      const formattedDeparture = departureDate ? format(new Date(departureDate), 'yyyy-MM-dd') : null;
      const formattedReturn = returnDate ? format(new Date(returnDate), 'yyyy-MM-dd') : null;

      const data = await findFlights({
        origin, destination, departureDate: formattedDeparture,
        returnDate: formattedReturn, adults, children, infants,
        travelClass, currencyCode, nonStop, maxPrice, max
      });

      setFlightData(data);
      setStatus(!data?.data?.length ? 'No Flights Found!' : 'Flights Found!');
    } catch (error) {
      console.error('Error fetching flights:', error);
      setStatus(`No Flights Found: ${error.message}`);
    }
  };

  return (
    <div className="flight-container">
      <h1 className="flight-header">
        <PlaneTakeoff className="icon-main" /> Flight Search
      </h1>

      <div className="flight-search">
        <form className="flight-form" onSubmit={handleSubmit}>
          {/* --- Basic Fields (Always Visible) --- */}
          <div className="input-group">
            <label htmlFor="origin">Origin</label>
            <input
              id="origin"
              type="text" 
              placeholder="Enter Origin..."
              value={origin}
              onChange={(e) => {setOrigin(e.target.value);
                                setStatus('Search Flights')
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="destination">Destination</label>
            <input
              id="destination"
              type="text"
              placeholder="Enter Destination..."
              value={destination}
              onChange={(e) => {setDestination(e.target.value); setStatus('Search Flights')}}
            />
          </div>

          <div className="input-group">
            <label htmlFor="departure">Departure Date</label>
            <input
              id="departure"
              type="date"
              value={departureDate}
              onChange={(e) => {setDepartureDate(e.target.value); setStatus('Search Flights')}}
            />
          </div>

          {/* --- Expandable Section --- */}
          {isExpanded && (
            <>
              <div className="input-group">
                <label htmlFor="return">Return Date</label>
                <input
                  id="return"
                  type="date"
                  value={returnDate}
                  onChange={(e) => {setReturnDate(e.target.value); setStatus('Search Flights')}}
                />
              </div>

              <div className="input-group">
                <label htmlFor="maxPrice">Max Budget</label>
                <input
                  id="maxPrice"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {setMaxPrice(e.target.value); setStatus('Search Flights')}}
                />
              </div>

              <div className="input-group">
                <label htmlFor="travelClass">Travel Class</label>
                <select
                  id="travelClass"
                  value={travelClass}
                  onChange={(e) => {setTravelClass(e.target.value); setStatus('Search Flights')}}
                >
                  <option value="">Any</option>
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={currencyCode}
                  onChange={(e) => {setCurrencyCode(e.target.value); setStatus('Search Flights')}}
                >
                  {currencyOptions.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>

              
              <div className="input-group">
                <label htmlFor="adults">Adults</label>
                <input
                  id="adults"
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => {setAdults(e.target.value); setStatus('Search Flights')}}
                />
              </div>

              <div className="input-group">
                <label htmlFor="children">Children</label>
                <input
                  id="children"
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => {setChildren(e.target.value); setStatus('Search Flights')}}
                />
              </div>

              <div className="input-group">
                <label htmlFor="infants">Infants</label>
                <input
                  id="infants"
                  type="number"
                  min="0"
                  value={infants}
                  onChange={(e) => {setInfants(e.target.value); setStatus('Search Flights')}
                  }
                />
              </div>


              <div className="input-group checkbox-group">
                <label htmlFor="nonStop">
                  <input
                    id="nonStop"
                    type="checkbox"
                    checked={nonStop}
                    onClick={(e) => {setNonStop(e.target.value); setStatus('Search Flights')}}
                  />
                  Non-Stop Flights Only
                </label>
              </div>
            </>
          )}

          {/* --- Toggle Button --- */}
          <div className="form-toggle">
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide Filters ▲' : 'Show More Filters ▼'}
            </button>
          </div>

          {/* --- Submit Button --- */}
          <div className="form-action">
            <button type="submit">{status}</button>
          </div>
        </form>
      </div>

      {/* --- Results --- */}
      <div className="results">
        {flightData?.data?.length > 0 ? (
          <div className="results-list">
            {flightData.data.map((flight, index) => (
              <Flight key={index} flight={flight} />
            ))}
          </div>
        ) : (
          <p className="status-text"></p>
        )}
      </div>
    </div>
  );
}

export default App;
