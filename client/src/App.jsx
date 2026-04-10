import React, { useRef, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

// Pages
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Layout from "./pages/Layout";

// Redux Slices
import { fetchUser } from "./features/user/userSlice";
import { fetchConnections } from "./features/connections/connectionsSlice";
import { addMessage } from "./features/messages/messagesSlice";

// Components
import Notification from "./components/Notification";

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  const dispatch = useDispatch();

  // Fetch user and connections data
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        if (token) {
          dispatch(fetchUser(token));
          dispatch(fetchConnections(token));
        }
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  // Update pathname ref
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // EventSource for real-time messages (SSE)
  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(
        `${import.meta.env.VITE_BASEURL}/api/message/${user.id}`,
      );

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (
            pathnameRef.current === `/messages/${message.from_user_id?._id}`
          ) {
            dispatch(addMessage(message));
          } else {
            toast.custom((t) => <Notification t={t} message={message} />, {
              position: "bottom-right",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
