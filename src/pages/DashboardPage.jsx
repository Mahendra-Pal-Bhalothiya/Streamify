import React from "react";
import { Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "../components/PageLoader";
import {
  UserIcon,
  UsersIcon,
  BellIcon,
  MessageSquare,
  BarChart3,
  Home,
  UserPlus,
} from "lucide-react";

const DashboardPage = () => {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;

  const stats = [
    { label: "Friends", value: "24", icon: UsersIcon, color: "bg-blue-500" },
    {
      label: "Messages",
      value: "12",
      icon: MessageSquare,
      color: "bg-green-500",
    },
    { label: "Requests", value: "3", icon: BellIcon, color: "bg-yellow-500" },
    {
      label: "Practice Hours",
      value: "8.5",
      icon: BarChart3,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back, {authUser?.fullName || "User"}! 👋
          </h1>
          <p className="text-base-content opacity-70">
            Here's what's happening with your language learning journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="size-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">
                <UserIcon className="size-5 mr-2" />
                Your Profile
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="avatar">
                  <div className="w-16 rounded-full">
                    <img
                      src={
                        authUser?.profilePic ||
                        "https://via.placeholder.com/150"
                      }
                      alt={authUser?.fullName}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{authUser?.fullName}</p>
                  <p className="text-sm opacity-70">{authUser?.email}</p>
                  <p className="text-sm mt-1">
                    Native: {authUser?.nativeLanguage || "Not set"} • Learning:{" "}
                    {authUser?.learningLanguage || "Not set"}
                  </p>
                </div>
              </div>
              <div className="card-actions justify-end">
                <Link to="/profile" className="btn btn-primary btn-sm">
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/" className="btn btn-outline w-full justify-start">
                  <Home className="size-4 mr-2" />
                  Go to Home
                </Link>
                <Link to="/" className="btn btn-outline w-full justify-start">
                  <UsersIcon className="size-4 mr-2" />
                  Find Language Partners
                </Link>
                <Link
                  to="/notifications"
                  className="btn btn-outline w-full justify-start"
                >
                  <BellIcon className="size-4 mr-2" />
                  View Friend Requests
                </Link>
                <Link
                  to="/chat"
                  className="btn btn-outline w-full justify-start"
                >
                  <MessageSquare className="size-4 mr-2" />
                  Open Chats
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-center opacity-70 py-8">
                No recent activity to show
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
