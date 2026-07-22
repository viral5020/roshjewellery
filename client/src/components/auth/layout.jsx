import { Outlet } from "react-router-dom";
import roshLogo from "../../assets/Lockup - White Bckg.svg";
function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-rosh-background font-sans">
      {/* Left side: Premium Branding decorative panel */}
      <div className="hidden lg:flex flex-col justify-between bg-rosh-primary w-1/2 p-16 relative overflow-hidden">
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none" />
        
        {/* Brand logo tag */}
        <div className="z-10">
          <span className="font-serif text-2xl tracking-[0.2em] text-rosh-highlight uppercase italic">
            Rosh
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 block mt-1">
            Fine Jewellery
          </span>
        </div>

        {/* Brand philosophy statement */}
        <div className="max-w-md space-y-6 z-10 my-auto">
          <h1 className="text-5xl font-serif italic text-white leading-tight">
            Crafted for <br />
            <span className="text-rosh-highlight">Generations</span>
          </h1>
          <div className="h-[1px] w-20 bg-rosh-highlight/40" />
          <p className="text-sm font-light text-white/80 leading-relaxed tracking-wide">
            Every piece of Rosh fine jewellery is a testament to extraordinary craftsmanship and timeless design. Welcome to our exclusive client space.
          </p>
        </div>

        {/* Footer info in the left panel */}
        <div className="z-10 text-[10px] uppercase tracking-[0.2em] text-white/40">
          © {new Date().getFullYear()} Rosh Fine Jewellery. All Rights Reserved.
        </div>
      </div>

      {/* Right side: Branded Login Form Area */}
      <div className="flex flex-1 items-center justify-center bg-rosh-background px-6 py-12 sm:px-12 lg:px-20 relative">
        <div className="w-full max-w-md space-y-8 bg-white/40 backdrop-blur-sm border border-rosh-primary/5 p-8 md:p-12 shadow-sm rounded-none">
          <div className="flex flex-col items-center mb-8 lg:hidden">
            {/* Small mobile logo display */}
            <img src={roshLogo} alt="Rosh Fine Jewellery" className="h-10 w-auto scale-[2]" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
