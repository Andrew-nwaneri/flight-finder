import { useState } from "react";
import { bookFlight } from "../services/brain";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
    // const [issuanceLocation, setIssuanceLocation] = useState('');
    const [issuanceDate, setIssuanceDate] = useState('');
    const [passNumber, setPassNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [nationality, setNationality] = useState('');
    const [status, setStatus] = useState('Submit');
    const [ bookingData, setBookingData ] = useState(null)


    const handleBooking = async (e) => {
        e.preventDefault();
        setStatus('Booking...')
        const formattedexpiry = expiryDate? format(new Date(expiryDate), 'yyyy-MM-dd') : null;
        const formattedIssued = issuanceDate ? format(new Date(issuanceDate), 'yyyy-MM-dd') : null;
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
                    issuanceLocation: nationality,
                    issuanceDate: formattedIssued,
                    number: passNumber,
                    expiryDate: formattedexpiry,
                    issuanceCountry: nationality.toUpperCase(),
                    validityCountry: nationality.toUpperCase(),
                    nationality: nationality.toUpperCase(),
                    holder: true,
                }
            ],
        }

        try{
            const response = await bookFlight(flight, travelers);
            if (response && response.data){
                setStatus(`Flight ${response.data.id} flight!`);
                setBookingData(response.data);
                alert(`Flight book! Order ID: ${response.data.id}`)
            }else{
                setStatus('Invalid Credentials');
                setTimeout(() => {setStatus('Try again')}, 5000);
                alert(`Booking failed: ${response.errors?.[0]?.detail || 'Check details and try again.'}`);

            }
        }catch(err){
            console.error(`Internal server error: ${err}`);
            setStatus('Internal Server Error');
            setTimeout(() => {setStatus('Try again')}, 5000);
            alert(err)
        }
    };
  
    const handleDownloadPDF = async () => {
        const ticketElement = document.getElementById("ticket-card");
            if (!ticketElement) return;

            // Use html2canvas to capture the ticket
        const canvas = await html2canvas(ticketElement);
        const imgData = canvas.toDataURL("image/png");

            // Create PDF and add the captured image
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 10;
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        pdf.save(`Flight_Ticket_${bookingData.id}.pdf`);
    };


    return(
        <div className="container">
       {bookingData ? (
        <div> 
            <p><strong>DISCLAIMER:</strong> this is a development server, hence all bookings are for testing purposes only</p>
            <div className="ticket-card" id="ticket-card">
            <h2> <Ticket className="icon ticket"/> Booking Confirmed!</h2>
            <p><strong>Order ID:</strong> {bookingData.id}</p>

            {bookingData.flightOffers && bookingData.flightOffers[0] && (
                <div className="ticket-flight">
                <p>
                    <strong>Airline:</strong>{" "}
                    {bookingData.flightOffers[0].validatingAirlineCodes?.[0]}
                </p>
                <p>
                    <strong>Total Price:</strong>{" "}
                    {bookingData.flightOffers[0].price?.total}{" "}
                    {bookingData.flightOffers[0].price?.currency}
                </p>
                </div>
            )}

            {bookingData.travelers && bookingData.travelers[0] && (
                <div className="ticket-traveler">
                <p>
                    <strong>Passenger:</strong>{" "}
                    {bookingData.travelers[0].name.firstName}{" "}
                    {bookingData.travelers[0].name.lastName}
                </p>
                <p>
                    <strong>Email:</strong>{" "}
                    {bookingData.travelers[0].contact.emailAddress}
                </p>
                </div>
            )}
            </div></div>
        ) : (
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
                    <p className="code">{segment?.departure?.iataCode}</p>{" "}
                    <PlaneTakeoff className="icon takeoff" />
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
                    <p className="code">{segment?.arrival?.iataCode}</p>{" "}
                    <PlaneLanding className="icon landing" />
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
            <div>
                <form onSubmit={handleBooking} className="booking-form">
                    <div className="full-name">
                        <label htmlFor="firstName">First name</label>
                        <input
                        value={firstName}
                        id="firstName"
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        type="text"
                        />
                        <label htmlFor="lastName">Last name</label>
                        <input
                        value={lastName}
                        id="lastName"
                        type="text"
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter Last name"
                        />
                    </div>

                    <label htmlFor="gender">Gender</label>
                    <select
                        value={gender}
                        id="gender"
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>

                    <label htmlFor="dateOfBirth">Date of birth</label>
                    <input
                        value={dateOfBirth}
                        id="dateOfBirth"
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        type="date"
                    />

                    <div className="contact-info">
                        <label htmlFor="emailAddress">Email Address</label>
                        <input
                        value={emailAddress}
                        id="emailAddress"
                        type="email"
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="Enter valid email address"
                        />
                        <div className="phone-number">
                        <label htmlFor="countryCallingCode">Country Code</label>
                        <input
                            value={countryCallingCode}
                            type="number"
                            id="countryCallingCode"
                            onChange={(e) => setCountryCallingCode(e.target.value)}
                            placeholder="Country Code"
                        />
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            value={phone}
                            type="number"
                            id="phone"
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                        />
                        </div>
                    </div>

                    <div className="document">
                        <label htmlFor="birthPlace">Place of birth</label>
                        <input
                        value={birthPlace}
                        id="birthPlace"
                        type="text"
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="City name"
                        />
                        {/* <label htmlFor="issuanceLocation">Issuance Location</label>
                        <input
                        value={issuanceLocation}
                        id="issuanceLocation"
                        type="text"
                        onChange={(e) => setIssuanceLocation(e.target.value)}
                        placeholder="E.g: NG"
                        /> */}
                        <label htmlFor="passNumber">Passport Number</label>
                        <input
                        type="text"
                        id="passNumber"
                        value={passNumber}
                        onChange={(e) => setPassNumber(e.target.value)}
                        placeholder="Enter Passport number"
                        />
                        <label htmlFor="issuanceDate">Issuance Date</label>
                        <input
                        value={issuanceDate}
                        id="issuanceDate"
                        type="date"
                        onChange={(e) => setIssuanceDate(e.target.value)}
                        />
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                        value={expiryDate}
                        id="expiryDate"
                        type="date"
                        onChange={(e) => setExpiryDate(e.target.value)}
                        />
                        <label htmlFor="nationality">Nationality Code</label>
                        <input
                        id="nationality"
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="E.g: NG"
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        {status || "Book Flight"}
                    </button>
                </form>
            </div>
        </div>
            
        )}
        {bookingData && (
            <div style={{ marginTop: "1rem" }}>
            <button
                onClick={handleDownloadPDF}
                className="download-btn"
            >
                Download Ticket as PDF
            </button>
            </div>
        )}

    </div>
    );
}

export default Book;