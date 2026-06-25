import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import Navbar from "./navbar";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-rosh-background min-h-screen">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default ShoppingLayout;
