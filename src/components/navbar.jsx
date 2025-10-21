import { Link } from "react-router-dom";
import "./Flight.css";
import { PlaneTakeoff } from "lucide-react";

function NavBar () {
    
    return (<nav>
        <div className="nav-brand">
        <Link to="/" className=""><PlaneTakeoff className="icon-main" /> Flight Search</Link>
        </div>
        <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/favourites" className="nav-link">Favourites</Link>
        </div>
    </nav>);
}

export default NavBar;