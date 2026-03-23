// frontend/src/pages/FriendsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  UserPlusIcon,
  MessageCircleIcon,
  VideoIcon,
  SearchIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import Avatar from "../components/Avtaar";
import {
  getUserFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  searchUsers,
} from "../lib/api";

const FriendsPage = ({ chatInitialized }) => {
  const { authUser } = useAuthUser();
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "friends") {
      loadFriends();
    } else if (activeTab === "requests") {
      loadFriendRequests();
    }
  }, [activeTab]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsData = await getUserFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      setLoading(true);
      const requests = await getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      setSearchResults((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, requestSent: true } : user,
        ),
      );
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      await loadFriendRequests();
      await loadFriends();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      // Add decline API call if you have one
      setFriendRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <UsersIcon className="size-8 text-primary" />
              Friends
            </h1>
            <p className="text-base-content/70 mt-2">
              Connect with friends and start video calls
            </p>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === "friends" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("friends")}
            >
              Friends ({friends.length})
            </button>
            <button
              className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Requests ({friendRequests.length})
            </button>
            <button
              className={`tab ${activeTab === "search" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("search")}
            >
              Find Friends
            </button>
          </div>

          {/* Friends List */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-lg">
                  <UsersIcon className="size-16 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                  <p className="text-base-content/70 mb-4">
                    Start connecting with people you know
                  </p>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="btn btn-primary"
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={friend.profilePic || friend.avatar}
                            name={friend.fullName || friend.username}
                            size={48}
                          />
                          <div>
                            <h3 className="font-semibold text-lg">
                              {friend.fullName || friend.username}
                            </h3>
                            <p className="text-sm text-base-content/70">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/chat/${friend._id}`}>
                            <button className="btn btn-sm btn-ghost gap-2">
                              <MessageCircleIcon className="size-4" />
                              Message
                            </button>
                          </Link>
                          <Link to={`/call/${friend._id}`}>
                            <button className="btn btn-sm btn-primary gap-2">
                              <VideoIcon className="size-4" />
                              Call
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Friend Requests */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : friendRequests.length === 0 ? (
                <div className="text-center py-12 bg-base-200 rounded-lg">
                  <UserPlusIcon className="size-16 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No pending requests
                  </h3>
                  <p className="text-base-content/70">
                    When someone sends you a friend request, it will appear here
                  </p>
                </div>
              ) : (
                friendRequests.map((request) => (
                  <div key={request._id} className="card bg-base-200 shadow-sm">
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={
                              request.sender?.profilePic ||
                              request.sender?.avatar
                            }
                            name={
                              request.sender?.fullName ||
                              request.sender?.username
                            }
                            size={48}
                          />
                          <div>
                            <h3 className="font-semibold">
                              {request.sender?.fullName ||
                                request.sender?.username}
                            </h3>
                            <p className="text-sm text-base-content/70">
                              Wants to connect with you
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="btn btn-sm btn-success gap-2"
                          >
                            <CheckIcon className="size-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request._id)}
                            className="btn btn-sm btn-ghost gap-2"
                          >
                            <XIcon className="size-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search Users */}
          {activeTab === "search" && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="input input-bordered flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="btn btn-primary gap-2"
                >
                  <SearchIcon className="size-4" />
                  Search
                </button>
              </div>

              {searchQuery && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12 bg-base-200 rounded-lg">
                      <SearchIcon className="size-16 mx-auto text-base-content/30 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No users found
                      </h3>
                      <p className="text-base-content/70">
                        Try a different name or email address
                      </p>
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="card bg-base-200 shadow-sm"
                      >
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar
                                src={user.profilePic || user.avatar}
                                name={user.fullName || user.username}
                                size={48}
                              />
                              <div>
                                <h3 className="font-semibold">
                                  {user.fullName || user.username}
                                </h3>
                                <p className="text-sm text-base-content/70">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            {user.requestSent ? (
                              <button
                                className="btn btn-sm btn-disabled gap-2"
                                disabled
                              >
                                <CheckIcon className="size-4" />
                                Request Sent
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendRequest(user._id)}
                                className="btn btn-sm btn-primary gap-2"
                              >
                                <UserPlusIcon className="size-4" />
                                Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
