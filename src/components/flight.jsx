import React from "react";
import {
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Building2,
  Ticket,
} from "lucide-react";
import "./Flight.css";
import { bookFlight } from "../services/brain";

function Flight({ flight }) {
  if (!flight) {
    return <p className="no-flight">Flight data unavailable...</p>;
  }

  const itinerary = flight?.itineraries?.[0];
  const segment = itinerary?.segments?.[0];

  const departureDateTime = segment?.departure?.at || "";
  const departureDate = departureDateTime.split("T")[0];
  const departureTime = departureDateTime.split("T")[1]?.slice(0, 5);
  const arrivalDateTime = segment?.arrival?.at || "";
  const arrivalDate = arrivalDateTime.split("T")[0];
  const arrivalTime = arrivalDateTime.split("T")[1]?.slice(0, 5);

  const airline = segment?.carrierCode || "Unknown Airline";
  const flightNumber = segment?.number || "N/A";
  const aircraft = segment?.aircraft?.code || "N/A";
  const duration = itinerary?.duration?.replace("PT", "").toLowerCase() || "N/A";
  const numberOfStops = itinerary?.segments?.length - 1 || 0;

  const price = flight?.price?.grandTotal;
  const currency = flight?.price?.currency || "USD";
  
  const handleBooking = (e) => {
    e.preventDefault();
    alert(`Flight - ${flightNumber} booked!`)
  }
  return (
    <div className="flight-card">
      <div className="flight-header">
        <Ticket className="icon ticket" />
        <h3>
          {airline} <span className="flight-number">#{flightNumber}</span>
        </h3>
      </div>

      <div className="flight-info">
        <div className="flight-leg">
          <PlaneTakeoff className="icon takeoff" />
          <div>
            <p className="code">{segment?.departure?.iataCode}</p>
            <p className="datetime">
              {departureDate} {departureTime && `• ${departureTime}`}
            </p>
          </div>
        </div>

        <div className="flight-duration">
          <Clock className="icon clock" />
          <p>{duration}</p>
          <p className="stops">
            {numberOfStops === 0
              ? "Non-stop"
              : `${numberOfStops} stop${numberOfStops > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flight-leg">
          <PlaneLanding className="icon landing" />
          <div>
            <p className="code">{segment?.arrival?.iataCode}</p>
            <p className="datetime">
              {arrivalDate} {arrivalTime && `• ${arrivalTime}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flight-meta">
        <Building2 className="icon small" />
        <span>Aircraft: {aircraft}</span>
      </div>

      <div className="flight-price">
        <p className="price-text">
          {price ? `${price} ${currency}` : "Price unavailable"}
        </p>
      </div>
      <button onClick={handleBooking} className="book-btn">Book</button>
    </div>
  );
}

export default Flight;
