import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { IoChatbubbleEllipsesSharp, IoClose, IoOpen } from "react-icons/io5";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplaintMode, setIsComplaintMode] = useState(false);
  const [isNewWindow, setIsNewWindow] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState({
    name: "",
    type: "",
    details: "",
  });
  const [complaints, setComplaints] = useState([]);
  const chatWindowRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle chatbot popup
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsComplaintMode(false);
    setShowComplaintForm(false);
    setComplaints([]); // Clear complaints when closing the chatbot
  };

  // Open chatbot in a new window
  const openChatbotWindow = () => {
    if (!chatWindowRef.current || chatWindowRef.current.closed) {
      chatWindowRef.current = window.open("/chatbot", "Chatbot", "width=400,height=600");
      setIsNewWindow(true);
    } else {
      chatWindowRef.current.focus();
    }
  };

  // Handle user message (only for Query Section)
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Directly specify the Rasa server URL
      const response = await axios.post(
        "http://localhost:5005/webhooks/rest/webhook", // Replace with your Rasa server URL
        { sender: "user", message: input } // Ensure the payload matches Rasa's expected format
      );

      if (response.data.length > 0) {
        const botReplies = response.data.map((res) => ({
          sender: "bot",
          text: res.text || "I didn't understand that.",
        }));
        setMessages([...newMessages, ...botReplies]);
      } else {
        setMessages([...newMessages, { sender: "bot", text: "I'm still thinking... Please wait." }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([...newMessages, { sender: "bot", text: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();

    if (!complaintDetails.name || !complaintDetails.type || !complaintDetails.details) {
      alert("Please fill all fields to submit a complaint.");
      return;
    }

    console.log("Submitting complaint:", complaintDetails); // Debugging Step

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/complaints/create`, // Replace with your backend URL
        complaintDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        alert("Your complaint has been logged. Thank you!");
        setMessages([...messages, { sender: "bot", text: "Your complaint has been logged. Thank you!" }]);
        setComplaintDetails({ name: "", type: "", details: "" });
        setShowComplaintForm(false);
      } else {
        alert("Error logging complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error logging complaint:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || "Something went wrong. Please try again."}`);
    }
  };

  // Handle tracking complaint
  const trackComplaint = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/complaints`, // Replace with your backend URL
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setComplaints(response.data.complaints);
      } else {
        alert("Error fetching complaints. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || "Something went wrong. Please try again."}`);
      } else {
        alert("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-3 bg-green-600 text-white rounded-full shadow-lg flex items-center hover:bg-green-700 transition-all"
        onClick={toggleChatbot}
      >
        {isOpen ? <IoClose size={24} /> : <IoChatbubbleEllipsesSharp size={24} />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="ml-2 p-3 bg-blue-600 text-white rounded-full shadow-lg flex items-center hover:bg-blue-700 transition-all"
        onClick={openChatbotWindow}
      >
        <IoOpen size={24} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-96 bg-white/90 backdrop-blur-md shadow-2xl rounded-lg fixed bottom-16 right-5 border border-green-200"
        >
          <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex justify-between items-center rounded-t-lg">
            <span className="text-lg font-semibold">Chatbot</span>
            <button onClick={toggleChatbot} className="text-white hover:text-green-200 transition-all">
              <IoClose size={20} />
            </button>
          </div>

          <div className="flex p-3 border-b border-green-200">
            <button
              onClick={() => setIsComplaintMode(false)}
              className={`flex-1 p-2 ${
                !isComplaintMode ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
              } rounded-md transition-all hover:bg-green-600`}
            >
              Ask Query
            </button>
            <button
              onClick={() => setIsComplaintMode(true)}
              className={`flex-1 p-2 ${
                isComplaintMode ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
              } rounded-md transition-all hover:bg-red-600`}
            >
              Log Complaint
            </button>
          </div>

          {!isComplaintMode ? (
            <div>
              <div className="p-4 h-64 overflow-y-auto bg-gradient-to-b from-green-50 to-white">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded-md ${
                      msg.sender === "user" ? "bg-green-100 text-green-900 ml-auto" : "bg-gray-100 text-gray-900"
                    } max-w-[80%]`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isLoading && <div className="text-gray-500 text-sm">Bot is typing...</div>}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-green-200 flex">
                <form onSubmit={sendMessage} className="flex w-full">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="ml-2 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-b from-green-50 to-white">
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all"
                >
                  Create Complaint
                </button>
                <button
                  onClick={trackComplaint}
                  className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all"
                >
                  Track Complaint
                </button>
              </div>

              {showComplaintForm && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Complaint Name"
                    value={complaintDetails.name}
                    onChange={(e) => setComplaintDetails({ ...complaintDetails, name: e.target.value })}
                    className="w-full p-2 border border-green-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    value={complaintDetails.type}
                    onChange={(e) => setComplaintDetails({ ...complaintDetails, type: e.target.value })}
                    className="w-full p-2 border border-green-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Complaint Type</option>
                    <option value="Technical Issues">Technical Issues</option>
                    <option value="MarketPlace Issues">MarketPlace Issue</option>
                    <option value="Farm Assistance">Farm Assistance</option>
                    <option value="General Queries">General Queries</option>
                    <option value="Miscellenous Queries">Miscellenous Queries</option>
                  </select>
                  <textarea
                    placeholder="Complaint Details"
                    value={complaintDetails.details}
                    onChange={(e) => setComplaintDetails({ ...complaintDetails, details: e.target.value })}
                    className="w-full p-2 border border-green-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={submitComplaint}
                    className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Complaint"}
                  </button>
                </div>
              )}

              {complaints.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Your Complaints</h3>
                  <ul className="space-y-2">
                    {complaints.map((complaint, index) => (
                      <li key={index} className="p-2 bg-gray-100 rounded-md">
                        <p><strong>Name:</strong> {complaint.name}</p>
                        <p><strong>Type:</strong> {complaint.type}</p>
                        <p><strong>Status:</strong> {complaint.status}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export { ChatbotWidget };