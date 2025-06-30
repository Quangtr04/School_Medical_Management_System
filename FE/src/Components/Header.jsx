import { MenuIcon, XIcon, HeartIcon } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import {
  RiAdminFill,
  RiParentFill,
  RiNurseFill,
  RiTeamFill,
} from "react-icons/ri";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userRoleId = user?.role_id;
  let roleName = "/";

  if (userRoleId === 1) {
    roleName = "admin";
  } else if (userRoleId === 2) {
    roleName = "manager";
  } else if (userRoleId === 3) {
    roleName = "nurse";
  } else {
    roleName = "parent";
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const getRoleInfo = (userRoleId) => {
    switch (userRoleId) {
      case 1:
        return { label: "Admin", icon: <RiAdminFill /> };
      case 2:
        return { label: "Manager", icon: <RiUserStarFill /> };
      case 3:
        return { label: "Y tá", icon: <RiNurseFill /> };
      case 4:
        return { label: "Phụ huynh", icon: <RiParentFill /> };
      default:
        return { label: "Người dùng", icon: null };
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={handleLinkClick}>
            <HeartIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              SchoolHealth
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:gap-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-lg font-medium ${
                  isActive &&
                  window.location.pathname === "/" &&
                  !window.location.hash
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/#blog-section"
              className={({ isActive }) =>
                `text-lg font-medium ${
                  isActive && window.location.hash === "#blog-section"
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              Blog
            </NavLink>
            <NavLink
              to="/#documents-section"
              className={({ isActive }) =>
                `text-lg font-medium ${
                  isActive && window.location.hash === "#documents-section"
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              Tài liệu
            </NavLink>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <NavLink
                to={`/${roleName}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:shadow-sm hover:border-blue-400 transition-all"
              >
                <span className="text-sm text-gray-700">
                  Xin chào,{" "}
                  <span className="font-semibold">{user?.fullname}</span>
                </span>
                {userRoleId && (
                  <span className="flex items-center gap-1 text-sm text-blue-600 font-semibold">
                    {getRoleInfo(userRoleId).icon}
                    {getRoleInfo(userRoleId).label}
                  </span>
                )}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Đăng nhập
              </NavLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={handleLinkClick}
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={handleLinkClick}
            >
              Blog
            </NavLink>
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={handleLinkClick}
            >
              Tài liệu
            </NavLink>
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-5">
              {isAuthenticated ? (
                <div className="text-base text-gray-700 text-center font-medium">
                  Xin chào,{" "}
                  <span className="font-semibold">{user?.fullname}</span>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  onClick={handleLinkClick}
                >
                  Đăng nhập
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )} */}
    </header>
  );
}
