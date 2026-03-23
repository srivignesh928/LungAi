import { NavLink } from "@/components/NavLink";
import { Activity } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LungAI
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            <NavLink
              to="/"
              className="text-foreground/70 hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              activeClassName="text-primary after:w-full"
            >
              Home
            </NavLink>
            <NavLink
              to="/predict"
              className="text-foreground/70 hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              activeClassName="text-primary after:w-full"
            >
              Predict
            </NavLink>
            <NavLink
              to="/analysis"
              className="text-foreground/70 hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              activeClassName="text-primary after:w-full"
            >
              Analysis
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
