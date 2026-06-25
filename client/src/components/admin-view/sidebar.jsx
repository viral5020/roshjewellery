import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
  Gift,
  User,
  Settings,
  ChevronLeft, 
  ChevronRight, 
  BarChart,
  Box,
  FileText,
  Ticket,
  ChartColumnBig,
  FilePlus2,
  PackageOpen,
  BellRing,
  Boxes,
  Sparkles,
} from "lucide-react";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import roshLogo from "../../assets/Lockup - White Bckg.svg";

// Admin Sidebar Menu Items
const adminSidebarMenuItems = [
  {
    id: "Reports",
    label: "Dashboard",
    path: "/admin/reports",
    icon: <BarChart size={24} />, 
  },
  {
    id: "dashboard",
    label: "Banner",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={24} />, 
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket size={24} />, 
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck size={24} />, 
  },
  {
    id: "customers",
    label: "Customers",
    path: "/admin/customer",
    icon: <User size={24} />, 
  },
  {
    id: "Inventory",
    label: "Inventory",
    path: "/admin/Inventory",
    icon: <PackageOpen size={24} />, 
  },
  {
    id: "category",
    label: "Category",
    path: "/admin/category",
    icon: <Box size={24} />, 
  },
  {
    id: "sub-category",
    label: "sub-Category",
    path: "/admin/SubCategoryPage",
    icon: <Boxes size={24} />, 
  },
  {
    id: "giftCard",
    label: "Coupon",
    path: "/admin/giftCard",
    icon: <Ticket size={24} />, 
  },
  {
    id: "allinvoice",
    label: "Invoice",
    path: "/admin/allinvoice",
    icon: <FileText size={24} />, 
  },
  {
    id: "invoice",
    label: "Create Invoice",
    path: "/admin/invoice",
    icon: <FilePlus2 size={24} />, 
  },
  {
    id: "sales",
    label: "Add Transaction",
    path: "/admin/sales",
    icon: <ChartColumnBig size={24} />, 
  },
  {
    id: "Subscribers",
    label: "Subscribers",
    path: "/admin/Subscribers",
    icon: <BellRing size={24} />, 
  },
  {
    id: "custom-orders",
    label: "Custom Orders",
    path: "/admin/custom-orders",
    icon: <Sparkles size={24} />,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    icon: <Settings size={24} />, 
  },
];

function MenuItems({ setOpen, collapsed }) {
  const navigate = useNavigate();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            navigate(menuItem.path);
            setOpen ? setOpen(false) : null;
          }}
          className="flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <div className="flex items-center justify-center">
            {menuItem.icon}
          </div>
          {/* Only show label when not collapsed */}
          {!collapsed && <span>{menuItem.label}</span>}
        </div>
      ))}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const [collapsed, setCollapsed] = useState(false); 
  const navigate = useNavigate();

  // Function to toggle sidebar collapse
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Fragment>
      {/* Mobile Sheet (Drawer) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex justify-center mt-5 mb-5">
                <img src={roshLogo} alt="Rosh Fine Jewellery" className="h-10 w-auto" />
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} collapsed={collapsed} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar (With Collapse Option) */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } hidden lg:flex flex-col border-r bg-background p-6 transition-all duration-300`}
      >
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer justify-center mb-5"
        >
          {!collapsed ? (
            <img src={roshLogo} alt="Rosh Fine Jewellery" className="h-10 w-auto" />
          ) : (
            <ChartNoAxesCombined size={30} />
          )}
        </div>

        {/* Menu Items */}
        <MenuItems collapsed={collapsed} setOpen={setOpen} />

        {/* Collapse button styled like other menu items */}
        <div
          onClick={toggleCollapse}
          className="flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground mt-auto"
        >
          {collapsed ? <ChevronRight size={25} /> : <ChevronLeft size={25} />}
          {!collapsed && <span>Collapse</span>} {/* Optionally display label */}
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
