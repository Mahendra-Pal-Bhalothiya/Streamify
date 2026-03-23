// frontend/src/components/Sidebar.jsx
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  UsersIcon,
  VideoIcon,
  CameraIcon,
  RadioIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import Avatar from "./Avtaar";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if user is live (you can implement this logic from your state)
  const isLive = false; // This should come from your live stream state

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Home */}
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/dashboard" ? "btn-active" : ""
          }`}
        >
          <LayoutDashboardIcon className="size-5 text-base-content opacity-70" />
          <span>Dashboard</span>
        </Link>

        {/* Live Stream */}
        <Link
          to="/live"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case relative ${
            currentPath === "/live" ? "btn-active" : ""
          } ${isLive ? "text-red-500" : ""}`}
        >
          {isLive ? (
            <RadioIcon className="size-5 text-red-500 animate-pulse" />
          ) : (
            <VideoIcon className="size-5 text-base-content opacity-70" />
          )}
          <span>Live Stream</span>
          {isLive && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </span>
          )}
        </Link>

        {/* Friends */}
        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>

        {/* Divider */}
        <div className="divider my-4"></div>

        {/* Go Live Button - Quick Action */}
        <button
          onClick={() => {
            window.location.href = "/live";
          }}
          className="btn btn-primary w-full gap-2 normal-case"
        >
          <CameraIcon className="size-4" />
          <span>Go Live Now</span>
        </button>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <Avatar
            src={authUser?.profilePic || authUser?.avatar}
            name={authUser?.fullName || authUser?.username}
            size={40}
          />
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {authUser?.fullName || authUser?.username}
            </p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block animate-pulse" />
              Online
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/live")}
            className="btn btn-xs btn-circle btn-ghost"
            title="Start Live Stream"
          >
            <CameraIcon className="size-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
