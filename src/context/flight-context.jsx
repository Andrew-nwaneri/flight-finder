import { createContext, useContext, useState, useEffect } from "react";

const flightContext = createContext();

export const contextProvider = () => useContext(flightContext)

export const favouriteContext = ({children}) => {
    const [favourite, setFavourite] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem("favourites");
        if (stored){
            setFavourite(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("favourites", JSON.stringify(favourite))
    }, [favourite]);

    const addTofavourites = (item) => {
        setFavourite(prev => [...prev, item])
    };

    const removeFavourite = (item) => {
        const flightID =  item?.itineraries?.[0].itinerary?.segments?.[0].segment?.number
        setFavourite(favourite.filter(flight => {flightID !== flight.itineraries?.[0].itinerary?.segments?.[0].segment?.number}))
    };

    const isFavourite = (itemID) => {
        return favourite.some(flight => {flight.ID === itemID})
    }

    const value = {
        favourite,
        isFavourite,
        removeFavourite,
        addTofavourites
    }
    
    return <flightContext.Provider value={value}>{children}</flightContext.Provider>
}