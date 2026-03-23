// frontend/src/pages/LiveStreamPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  VideoIcon,
  MicIcon,
  MicOffIcon,
  VideoOffIcon,
  UsersIcon,
  MessageCircleIcon,
  XIcon,
  SendIcon,
  Share2Icon,
  RefreshCwIcon,
  SettingsIcon,
  MonitorIcon,
} from "lucide-react";
import Layout from "../components/Layout";
import useAuthUser from "../hooks/useAuthUser";
import Avatar from "../components/Avtaar";

const LiveStreamPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [streamStarted, setStreamStarted] = useState(false);
  const [screenShareAvailable, setScreenShareAvailable] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chatContainerRef = useRef(null);
  const cameraStreamRef = useRef(null); // Separate ref for camera stream
  const screenStreamRef = useRef(null); // Separate ref for screen share stream
  const previewStreamRef = useRef(null);
  const activeStreamRef = useRef(null); // Track which stream is currently active

  // Check if screen sharing is available
  useEffect(() => {
    const checkScreenShareAvailability = () => {
      const isAvailable = !!(
        navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
      );
      setScreenShareAvailable(isAvailable);
      if (!isAvailable) {
        console.log("Screen sharing not supported in this browser");
      }
    };
    checkScreenShareAvailability();
  }, []);

  // Request permissions and get devices on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Clean up all streams on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (activeStreamRef.current) {
        activeStreamRef.current = null;
      }
    };
  }, []);

  const requestPermissions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser doesn't support camera/microphone access",
        );
      }

      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      testStream.getTracks().forEach((track) => track.stop());
      setPermissionGranted(true);
      await getAvailableDevices();
    } catch (err) {
      console.error("Permission error:", err);
      let errorMessage = "Unable to access camera/microphone. ";

      if (err.name === "NotAllowedError") {
        errorMessage +=
          "Please grant permission to use your camera and microphone.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera or microphone found on your device.";
      } else if (err.name === "NotReadableError") {
        errorMessage +=
          "Your camera/microphone is already in use by another application.";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      setPermissionGranted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const microphones = devices.filter(
        (device) => device.kind === "audioinput",
      );

      setVideoDevices(cameras);
      setAudioDevices(microphones);

      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
      if (microphones.length > 0 && !selectedMic) {
        setSelectedMic(microphones[0].deviceId);
      }

      console.log(
        "Available cameras:",
        cameras.map((c) => c.label),
      );
    } catch (error) {
      console.error("Error getting devices:", error);
    }
  };

  const startCamera = async () => {
    try {
      // Stop any existing camera stream
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }

      const constraints = {
        video:
          videoEnabled && selectedCamera
            ? {
                deviceId: selectedCamera
                  ? { exact: selectedCamera }
                  : undefined,
                width: { ideal: 1280, min: 640, max: 1920 },
                height: { ideal: 720, min: 480, max: 1080 },
                frameRate: { ideal: 30, min: 15, max: 60 },
              }
            : videoEnabled
              ? true
              : false,
        audio:
          audioEnabled && selectedMic
            ? {
                deviceId: selectedMic ? { exact: selectedMic } : undefined,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : audioEnabled
              ? true
              : false,
      };

      console.log("Starting camera with constraints:", constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      console.log(
        "Camera stream created - Video tracks:",
        videoTracks.length,
        "Audio tracks:",
        audioTracks.length,
      );

      if (videoEnabled && videoTracks.length === 0) {
        throw new Error("No video track available. Please check your camera.");
      }

      cameraStreamRef.current = stream;

      // Only set as active stream if not screen sharing
      if (!isScreenSharing) {
        activeStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = false;

          const playVideo = async (retryCount = 0) => {
            try {
              await videoRef.current.play();
              console.log("Camera stream playing successfully!");
              setStreamStarted(true);
            } catch (playError) {
              console.error("Video play failed:", playError);
              if (retryCount < 3) {
                setTimeout(() => playVideo(retryCount + 1), 500);
              } else {
                throw new Error("Failed to play camera stream");
              }
            }
          };

          await playVideo();
        }
      }

      return stream;
    } catch (error) {
      console.error("Error starting camera:", error);
      throw error;
    }
  };

  const startScreenShare = async () => {
    if (!screenShareAvailable) {
      alert("Screen sharing is not supported in your browser");
      return;
    }

    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Stop camera stream but keep it in memory
      if (
        cameraStreamRef.current &&
        activeStreamRef.current === cameraStreamRef.current
      ) {
        // Stop the video element from displaying camera
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }

      // Clean up any existing screen share stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      // Simplified constraints for better compatibility
      const constraints = {
        video: {
          cursor: "always",
        },
        audio: false, // Disable audio from screen share to avoid conflicts
      };

      console.log("Starting screen share with constraints:", constraints);

      // Request screen share
      const screenStream =
        await navigator.mediaDevices.getDisplayMedia(constraints);
      screenStreamRef.current = screenStream;

      // Listen for when user stops sharing via browser UI
      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          console.log("Screen sharing stopped by user");
          stopScreenShare();
        });
      }

      // Handle audio separately with microphone
      let finalStream = screenStream;

      if (audioEnabled) {
        try {
          // Get microphone stream separately
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: selectedMic
              ? {
                  deviceId: { exact: selectedMic },
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                }
              : true,
          });

          // Combine screen video with microphone audio
          const combinedStream = new MediaStream();
          screenStream
            .getVideoTracks()
            .forEach((track) => combinedStream.addTrack(track));
          micStream
            .getAudioTracks()
            .forEach((track) => combinedStream.addTrack(track));

          finalStream = combinedStream;

          // Store mic stream for cleanup
          screenStreamRef.current.micStream = micStream;
        } catch (micError) {
          console.warn("Could not access microphone:", micError);
          // Continue without microphone
        }
      }

      // Set as active stream
      activeStreamRef.current = finalStream;

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = finalStream;
        videoRef.current.muted = false;

        const playVideo = async (retryCount = 0) => {
          try {
            await videoRef.current.play();
            console.log("Screen share started successfully!");
            setIsScreenSharing(true);
            setStreamStarted(true);
          } catch (playError) {
            console.error("Video play attempt failed:", playError);
            if (retryCount < 3) {
              setTimeout(() => playVideo(retryCount + 1), 500);
            } else {
              throw new Error("Failed to play screen share stream");
            }
          }
        };

        await playVideo();
      }

      // Add system message to chat
      const systemMessage = {
        id: Date.now(),
        user: "System",
        message: "Started sharing screen",
        timestamp: new Date(),
        isSystem: true,
      };
      setChatMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Error starting screen share:", error);
      let errorMessage = "Unable to share screen. ";

      if (error.name === "NotAllowedError") {
        errorMessage += "Please grant permission to share your screen.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No screen sharing source found.";
      } else if (error.name === "AbortError") {
        errorMessage += "Screen sharing was cancelled.";
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      alert(errorMessage);

      // If screen share fails, switch back to camera
      if (isStreaming && cameraStreamRef.current) {
        console.log("Falling back to camera");
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStreamRef.current;
          await videoRef.current.play();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopScreenShare = async () => {
    console.log("Stopping screen share...");

    // Clean up screen share stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped screen share track:", track.kind);
      });

      // Clean up microphone stream if it was added separately
      if (screenStreamRef.current.micStream) {
        screenStreamRef.current.micStream
          .getTracks()
          .forEach((track) => track.stop());
        screenStreamRef.current.micStream = null;
      }

      screenStreamRef.current = null;
    }

    setIsScreenSharing(false);

    // Add system message to chat
    const systemMessage = {
      id: Date.now(),
      user: "System",
      message: "Stopped sharing screen",
      timestamp: new Date(),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, systemMessage]);

    // Switch back to camera if streaming and camera exists
    if (isStreaming && cameraStreamRef.current) {
      console.log("Switching back to camera after screen share");
      try {
        activeStreamRef.current = cameraStreamRef.current;

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStreamRef.current;
          await videoRef.current.play();
          console.log("Switched back to camera successfully");
        }
      } catch (error) {
        console.error("Failed to switch back to camera:", error);
        setError(
          "Failed to switch back to camera. Please restart your stream.",
        );
      }
    }
  };

  const startStream = async () => {
    if (!streamTitle.trim()) {
      alert("Please enter a stream title");
      return;
    }

    if (!permissionGranted) {
      await requestPermissions();
      if (!permissionGranted) {
        alert("Camera and microphone permissions are required to stream");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Stop any existing preview stream
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((track) => track.stop());
        previewStreamRef.current = null;
      }

      // Start with camera
      await startCamera();

      setIsStreaming(true);
      setViewerCount(Math.floor(Math.random() * 100) + 10);

      // Simulate random viewers joining
      const interval = setInterval(() => {
        setViewerCount((prev) => prev + Math.floor(Math.random() * 3));
      }, 30000);

      streamRef.current = interval;

      // Reset video off state
      setIsVideoOff(false);

      alert("Stream started successfully!");
    } catch (error) {
      console.error("Error starting stream:", error);

      let errorMessage = "Unable to start stream. ";
      if (error.name === "NotAllowedError") {
        errorMessage += "Please grant camera and microphone permissions.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera or microphone found.";
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = () => {
    // Stop camera stream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped camera track:", track.kind);
      });
      cameraStreamRef.current = null;
    }

    // Stop screen share stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      if (screenStreamRef.current.micStream) {
        screenStreamRef.current.micStream
          .getTracks()
          .forEach((track) => track.stop());
      }
      screenStreamRef.current = null;
    }

    if (streamRef.current) {
      clearInterval(streamRef.current);
      streamRef.current = null;
    }

    setIsStreaming(false);
    setIsScreenSharing(false);
    setStreamStarted(false);
    setViewerCount(0);
    activeStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    const currentStream = activeStreamRef.current;
    if (currentStream) {
      const audioTracks = currentStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
        console.log("Audio track enabled:", track.enabled);
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (!isScreenSharing && activeStreamRef.current) {
      const videoTracks = activeStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
        console.log("Video track enabled:", track.enabled);
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: authUser?.fullName || authUser?.username,
      userId: authUser?._id,
      avatar: authUser?.profilePic,
      message: message,
      timestamp: new Date(),
      isOwn: true,
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage("");
  };

  const handleGoLive = () => {
    if (!isStreaming) {
      startStream();
    } else {
      if (window.confirm("Are you sure you want to end your stream?")) {
        stopStream();
      }
    }
  };

  const previewStream = async () => {
    if (isStreaming) {
      alert("Cannot preview while streaming");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video:
          videoEnabled && selectedCamera
            ? {
                deviceId: { exact: selectedCamera },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : videoEnabled
              ? true
              : false,
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      previewStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;

        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Preview started successfully!");
        }
      }
    } catch (error) {
      console.error("Preview error:", error);
      let errorMessage = "Unable to preview camera. ";
      if (error.name === "NotAllowedError") {
        errorMessage += "Please grant camera permissions.";
      } else {
        errorMessage += error.message;
      }
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stopPreview = () => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((track) => track.stop());
      previewStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
  };

  const handleDeviceChange = async () => {
    if (isStreaming && !isScreenSharing) {
      const shouldRestart = window.confirm(
        "Changing devices will restart your stream. Continue?",
      );
      if (shouldRestart) {
        stopStream();
        setTimeout(() => startStream(), 1000);
      }
    } else if (previewStreamRef.current) {
      await previewStream();
    }
  };

  // Debug: Log video element state when streaming
  useEffect(() => {
    if (isStreaming && videoRef.current) {
      console.log("Video element state:", {
        srcObject: !!videoRef.current.srcObject,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        isScreenSharing,
      });
    }
  }, [isStreaming, isScreenSharing]);

  if (!isStreaming) {
    return (
      <Layout showSidebar={true}>
        <div className="min-h-screen bg-base-100">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Camera Preview */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Camera Preview</h2>
                    <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: "scaleX(-1)" }}
                      />
                      {!previewStreamRef.current &&
                        !isLoading &&
                        !isStreaming && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                            <p className="text-white text-center px-4">
                              Click "Test Camera" to preview
                              <br />
                              <span className="text-sm opacity-75">
                                Make sure your camera is connected
                              </span>
                            </p>
                          </div>
                        )}
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <span className="loading loading-spinner loading-lg text-white"></span>
                        </div>
                      )}
                    </div>
                    {error && (
                      <div className="alert alert-error mt-4">
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stream Settings */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">
                      <VideoIcon className="size-6 text-primary" />
                      Go Live
                    </h2>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Stream Title</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter a title for your stream..."
                        className="input input-bordered"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSettings(!showSettings)}
                      className="btn btn-outline mb-4 gap-2"
                    >
                      <SettingsIcon className="size-4" />
                      {showSettings ? "Hide Settings" : "Show Settings"}
                    </button>

                    {showSettings && (
                      <>
                        <div className="form-control mb-4">
                          <label className="label">
                            <span className="label-text">Camera</span>
                          </label>
                          <select
                            className="select select-bordered"
                            value={selectedCamera}
                            onChange={(e) => {
                              setSelectedCamera(e.target.value);
                              handleDeviceChange();
                            }}
                            disabled={isStreaming}
                          >
                            {videoDevices.length === 0 ? (
                              <option value="">No cameras found</option>
                            ) : (
                              videoDevices.map((device) => (
                                <option
                                  key={device.deviceId}
                                  value={device.deviceId}
                                >
                                  {device.label ||
                                    `Camera ${device.deviceId.slice(0, 5)}`}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="form-control mb-4">
                          <label className="label">
                            <span className="label-text">Microphone</span>
                          </label>
                          <select
                            className="select select-bordered"
                            value={selectedMic}
                            onChange={(e) => {
                              setSelectedMic(e.target.value);
                              handleDeviceChange();
                            }}
                            disabled={isStreaming}
                          >
                            {audioDevices.length === 0 ? (
                              <option value="">No microphones found</option>
                            ) : (
                              audioDevices.map((device) => (
                                <option
                                  key={device.deviceId}
                                  value={device.deviceId}
                                >
                                  {device.label ||
                                    `Microphone ${device.deviceId.slice(0, 5)}`}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="flex gap-4 mb-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={videoEnabled}
                              onChange={(e) =>
                                setVideoEnabled(e.target.checked)
                              }
                              className="checkbox checkbox-primary"
                            />
                            <span>Enable Video</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={audioEnabled}
                              onChange={(e) =>
                                setAudioEnabled(e.target.checked)
                              }
                              className="checkbox checkbox-primary"
                            />
                            <span>Enable Audio</span>
                          </label>
                        </div>
                      </>
                    )}

                    <div className="card-actions justify-end">
                      {previewStreamRef.current ? (
                        <button
                          onClick={stopPreview}
                          className="btn btn-warning gap-2"
                        >
                          <XIcon className="size-4" />
                          Stop Preview
                        </button>
                      ) : (
                        <button
                          onClick={previewStream}
                          disabled={isLoading || !videoEnabled}
                          className="btn btn-secondary gap-2"
                        >
                          <RefreshCwIcon className="size-4" />
                          Test Camera
                        </button>
                      )}
                      <button
                        onClick={handleGoLive}
                        disabled={
                          !streamTitle.trim() || isLoading || !videoEnabled
                        }
                        className="btn btn-primary gap-2"
                      >
                        {isLoading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <VideoIcon className="size-4" />
                        )}
                        {isLoading ? "Starting..." : "Start Stream"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {!permissionGranted && (
                <div className="alert alert-warning mt-6">
                  <VideoIcon className="size-4" />
                  <span>
                    Camera and microphone access required. Please click the
                    permission button when prompted.
                  </span>
                  <button
                    onClick={requestPermissions}
                    className="btn btn-sm btn-warning"
                  >
                    Request Permissions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Stream Header */}
      <div className="bg-base-200 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{streamTitle}</h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-semibold text-red-500">LIVE</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <UsersIcon className="size-4" />
              <span>{viewerCount} viewers</span>
            </div>
            {isScreenSharing && (
              <div className="flex items-center gap-1 text-sm bg-primary/20 px-2 py-1 rounded">
                <MonitorIcon className="size-3" />
                <span>Screen Sharing</span>
              </div>
            )}
          </div>

          <button onClick={handleGoLive} className="btn btn-error btn-sm gap-2">
            <XIcon className="size-4" />
            End Stream
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player */}
        <div className="flex-1 bg-black relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Video Loading/Error Overlay */}
          {streamStarted === false && isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center">
                <span className="loading loading-spinner loading-lg text-white"></span>
                <p className="text-white mt-4">Starting stream...</p>
              </div>
            </div>
          )}

          {/* Video Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            <button
              onClick={toggleMute}
              className="btn btn-circle btn-sm bg-black/50 hover:bg-black/70 text-white"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOffIcon className="size-4" />
              ) : (
                <MicIcon className="size-4" />
              )}
            </button>

            {!isScreenSharing && (
              <button
                onClick={toggleVideo}
                className="btn btn-circle btn-sm bg-black/50 hover:bg-black/70 text-white"
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? (
                  <VideoOffIcon className="size-4" />
                ) : (
                  <VideoIcon className="size-4" />
                )}
              </button>
            )}

            {screenShareAvailable && (
              <button
                onClick={startScreenShare}
                className={`btn btn-circle btn-sm ${
                  isScreenSharing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-black/50 hover:bg-black/70"
                } text-white`}
                title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
              >
                <MonitorIcon className="size-4" />
              </button>
            )}

            <button
              className="btn btn-circle btn-sm bg-black/50 hover:bg-black/70 text-white"
              title="Share"
              onClick={() => {
                const streamUrl = `${window.location.origin}/stream/${Date.now()}`;
                navigator.clipboard.writeText(streamUrl);
                alert("Stream link copied to clipboard!");
              }}
            >
              <Share2Icon className="size-4" />
            </button>
          </div>

          {/* Streamer Info */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5">
            <Avatar
              src={authUser?.profilePic}
              name={authUser?.fullName || authUser?.username}
              size={32}
            />
            <div>
              <p className="text-sm font-semibold text-white">
                {authUser?.fullName || authUser?.username}
              </p>
              <p className="text-xs text-green-400">
                {isScreenSharing ? "Sharing screen" : "Live now"}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-base-200 flex flex-col border-l border-base-300">
          <div className="p-4 border-b border-base-300">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircleIcon className="size-4" />
              Live Chat
            </h3>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat ${msg.isOwn ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  {!msg.isSystem && (
                    <Avatar src={msg.avatar} name={msg.user} size={32} />
                  )}
                </div>
                <div className="chat-header">
                  {msg.user}
                  <time className="text-xs opacity-50 ml-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </time>
                </div>
                <div
                  className={`chat-bubble ${msg.isSystem ? "chat-bubble-info" : ""}`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-base-300">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Say something..."
                className="input input-bordered flex-1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="btn btn-primary btn-circle"
              >
                <SendIcon className="size-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;
