import { MenuIcon, XIcon, HeartIcon } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  RiAdminFill,
  RiParentFill,
  RiNurseFill,
  RiTeamFill,
  RiUserStarFill,
} from "react-icons/ri";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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

  const getNavLinkClass =
    (path, hash = "") =>
    ({ isActive }) => {
      const isHomeActive = isActive && path === "/" && !location.hash;
      const isHashLinkActive = isActive && hash && location.hash === hash;
      const isCurrentActive = isHomeActive || isHashLinkActive;

      return `
      text-lg
      font-medium
      transition-colors duration-200 ease-in-out
      ${
        isCurrentActive
          ? "text-blue-600 border-b-2 border-blue-600 pb-1"
          : "text-gray-700 hover:text-blue-600"
      }
    `;
    };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Giữ justify-between để logo trái, nhóm phải phải */}
        <div className="flex justify-between items-center h-16">
          {/* Logo (ở bên trái) */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0"
            onClick={handleLinkClick}
          >
            <HeartIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              SchoolHealth
            </span>
          </Link>

          {/* Desktop Navigation (được căn giữa độc lập) */}
          {/* Sử dụng mx-auto để đẩy navigation ra giữa giữa logo và phần bên phải */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-x-16">
              <NavLink to="/" className={getNavLinkClass("/")}>
                Trang chủ
              </NavLink>
              <NavLink
                to="/#blog-section"
                className={getNavLinkClass("/#blog-section", "#blog-section")}
              >
                Blog
              </NavLink>
              <NavLink
                to="/#documents-section"
                className={getNavLinkClass(
                  "/#documents-section",
                  "#documents-section"
                )}
              >
                Tài liệu
              </NavLink>
            </nav>
          </div>

          {/* Desktop Right Side (ở bên phải) */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {isAuthenticated ? (
              <NavLink
                to={`/${roleName}`}
                className="flex items-center gap-2 px-4 py-5 hover:shadow-sm hover:border-blue-400 transition-all"
              >
                <span className="text-medium text-gray-900">
                  Xin chào,{" "}
                  <span className="font-semibold">{user?.fullname}</span>
                </span>
                {userRoleId && (
                  <div className="flex items-center gap-1 text-sm text-blue-600 font-bold">
                    <span> {getRoleInfo(userRoleId).icon}</span>
                    <span>{getRoleInfo(userRoleId).label}</span>
                  </div>
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
      {/* Mobile menu (uncomment to use) */}
      {/* ... mobile menu code ... */}
    </header>
  );
}
