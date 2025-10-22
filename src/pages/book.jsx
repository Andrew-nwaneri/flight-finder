import { useState } from "react";
import { bookFlight } from "../services/brain";
import { useLocation } from "react-router-dom";
import { Ticket, PlaneTakeoff, PlaneLanding, Clock, Building2 } from "lucide-react";
import "../components/Flight.css"
import { format } from "date-fns";

function Book() {
    const location = useLocation()
    const flight = location.state?.flight;
    if(!flight) return <p>No flight selected</p>;

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

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('MALE');
    const [emailAddress, setEmailAddress] = useState('');
    const [countryCallingCode, setCountryCallingCode] = useState('');
    const [phone, setPhone] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [issuanceLocation, setIssuanceLocation] = useState('');
    const [issuanceDate, setIssuanceDate] = useState('');
    const [passNumber, setPassNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [nationality, setNationality] = useState('');
    const [status, setStatus] = useState('Submit');


    const handleBooking = async (e) => {
        e.preventDefault();
        setStatus('Booking...')
        const formattedexpiry = expiryDate? format(new Date(expiryDate), 'yyyy-MM-dd') : null;
        const fornattedIssued = issuanceDate? format(new Date(issuanceDate), 'yyyy-MM-dd') : null;
        const formatteddob = dateOfBirth? format(new Date(dateOfBirth), 'yyyy-MM-dd') : null

        const travelers = {
            id: "1",
            dateOfBirth: formatteddob,
            name: {firstName: firstName, lastName: lastName},
            gender: gender,
            contact: {
                emailAddress: emailAddress,
                phones: [
                    {
                        deviceType: "MOBILE",
                        countryCallingCode: countryCallingCode,
                        number: phone,
                    }
                ],
            },
            documents: [
                {
                    documentType: "PASSPORT",
                    birthPlace: birthPlace,
                    issuanceLocation: issuanceLocation,
                    issuanceDate: fornattedIssued,
                    number: passNumber,
                    expiryDate: formattedexpiry,
                    issuanceCountry: nationality,
                    validityCountry: nationality,
                    nationality: nationality,
                    holder: true,
                }
            ],
        }


        try{
        const booking = await bookFlight(flight, travelers);
        if (booking && booking.data) {
            alert(`Flight booked! Order ID: ${booking.data.id}`);
            setStatus('Booked')
        } else {
            alert('Booking failed. Please try again.');
            setStatus('Invalid credentials');
            setTimeout(() => {
                setStatus('Try agian');
            }, 3000);
            
        }
        }catch(err){
        alert(err.message)
                    setStatus('Invalid credentials');
            setTimeout(() => {
                setStatus('Try agian');
            }, 3000);
        }
    }

    return(
        <div className="container">
            <div className="flight-card">
                <div className="flight-header">
                    <Ticket className="icon ticket" />
                    <h3>
                    {airline} <span className="flight-number">#{flightNumber}</span>
                    </h3>
                </div>

                <div className="flight-info">
                    <div className="flight-leg">
                    
                    <div>
                        <p className="code">{segment?.departure?.iataCode}</p> <PlaneTakeoff className="icon takeoff" />
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
                    
                    <div>
                        <p className="code">{segment?.arrival?.iataCode}</p> <PlaneLanding className="icon landing" />
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
            </div>
            
            <div >
                <form onSubmit={handleBooking} className="booking-form">
                    <div className="full-name">
                        <label htmlFor='firstName'>First name</label>
                            <input value={firstName} id='firstName' onChange={(e) => setFirstName(e.target.value)} placeholder="Enter first name" type="text"/>
                        <label htmlFor="lastName">Last name</label>
                            <input value={lastName} id='lastName' type="text" onChange={(e) => setLastName(e.target.value )} placeholder="Enter Last name"/>
                    </div>

                    <label htmlFor="gender">Gender</label>
                    <select value={gender} id="gender" onChange={(e) => setGender(e.target.value)}>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>

                    <label htmlFor='dateOfBirth'>Date of birth</label>
                        <input value={dateOfBirth} id='dateOfBirth' onChange={(e) => setDateOfBirth(e.target.value)} type="date"/>
                    
                    <div className="contact-info">
                        <label htmlFor="emailAddress">Email Address</label>
                            <input value={emailAddress}  id='emailAddress' type="email" onChange={(e) => setEmailAddress(e.target.value )} placeholder="Enter valid email address"/>
                        <div className="phone-number">
                            <label htmlFor='countryCallingCode'>Country Code</label>
                                <input value={countryCallingCode} type="number" id='countryCallingCode' onChange={(e) => setCountryCallingCode(e.target.value)} placeholder="Country Code"/>
                            <label htmlFor="phone">Phone Number</label>
                                <input value={phone}  type="number" id='phone' onChange={(e) => setPhone(e.target.value )} placeholder="Enter phone number"/>
                        </div>
                    </div>

                    <div className="document">
                        <label htmlFor='birthPlace'>Place of birth</label>
                            <input value={birthPlace} id='birthPlace' type="text" onChange={(e) => setBirthPlace(e.target.value)} placeholder="Enter city of birth"/>
                        <label htmlFor="issuanceLocation">Issuance Location</label>
                            <input value={issuanceLocation} id='issuanceLocation' type="text" onChange={(e) => setIssuanceLocation(e.target.value )} placeholder="E.g: NG"/>
                        <label htmlFor="passNumber">Passport Number</label>
                            <input type="number"  id="passNumber" value={passNumber} onChange={(e) => setPassNumber(e.target.value)} placeholder="Enter Passport number"/>
                        <label htmlFor='issuanceDate'>Issuance Date</label>
                            <input value={issuanceDate} id='issuanceDate' type="date" onChange={(e) => setIssuanceDate(e.target.value)} placeholder="Enter passport issued date"/>
                        <label htmlFor="expiryDate">Expiry Date</label>
                            <input value={expiryDate}  id='expiryDate' type="date" onChange={(e) => setExpiryDate(e.target.value )} placeholder="Enter passport expiry date"/>
                        <label htmlFor="nationality">Nationality Code</label>
                            <input id="nationality" type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="E.g: NG"/>
                    </div>
                    <button type="submit" className="submit-btn">{status}</button>
                </form>
            </div>
        </div>
    );
}

export default Book;