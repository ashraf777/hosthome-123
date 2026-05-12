"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Send, MapPin, Calendar, Clock, Lock, MessageCircle, Home } from "lucide-react";
import { toast } from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { api as hosthomeApi } from "@/services/api";

export default function GuestPortalPage() {
  const params = useParams();
  const token = params.token;

  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchBookingSummary();
      
      const intervalId = setInterval(() => {
        silentFetchMessages();
      }, 8000);
      
      return () => clearInterval(intervalId);
    }
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const silentFetchMessages = async () => {
    try {
      const msgRes = await hosthomeApi.getGuestPortalMessages(token);
      setMessages(msgRes || []);
    } catch (error) {
      // ignore
    }
  };

  const fetchBookingSummary = async () => {
    try {
      setLoading(true);
      const summaryRes = await hosthomeApi.getGuestPortalSummary(token);
      setBooking(summaryRes);

      const msgRes = await hosthomeApi.getGuestPortalMessages(token);
      setMessages(msgRes || []);
    } catch (error) {
      toast.error("Invalid or expired booking link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !booking) return;

    try {
      setSending(true);
      const payload = { content: newMessage };
      const res = await hosthomeApi.sendGuestPortalMessage(token, payload);
      
      setMessages((prev) => [...prev, res]);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse">Loading your reservation...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md text-center py-8">
          <CardHeader>
            <Lock className="h-12 w-12 text-red-400 mx-auto mb-2" />
            <CardTitle className="text-2xl text-gray-900">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">This magic link is invalid or has expired. Please check your email for the correct link or contact your host.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const isPast = checkOutDate < new Date();

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-10">
        <div className="font-bold text-xl text-blue-600 flex items-center tracking-tight">
          <Home className="mr-2 h-6 w-6" /> HostHome
        </div>
        <div className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
          {String(booking.status || 'Confirmed').toUpperCase()}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl p-4 md:p-8 grid gap-8 md:grid-cols-3">
        {/* Left Column: Booking Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-2xl shadow-sm border-gray-200 overflow-hidden">
            {/* Minimal Property Header Image Placeholder */}
            <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 w-full flex items-end p-4">
               <h2 className="text-white text-xl font-bold shadow-sm">{booking.property.name}</h2>
            </div>
            
            <CardContent className="pt-6 space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">
                  Welcome, {booking.guest.first_name}!
                </h1>
                <p className="text-sm text-gray-500">Here are your reservation details.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Check-in</p>
                    <p className="text-gray-600">{format(checkInDate, "MMM d, yyyy")}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Check-out</p>
                    <p className="text-gray-600">{format(checkOutDate, "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <p>
                  {booking.property.address_line_1}<br />
                  {booking.property.city}, {booking.property.state} {booking.property.postcode}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-gray-200 bg-blue-50/50">
            <CardContent className="p-6">
               <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                 <Clock className="h-4 w-4 mr-2" /> Check-in Instructions
               </h3>
               <p className="text-sm text-blue-800/80 leading-relaxed">
                 You will automatically receive your access codes in the chat panel here a few days before arrival. Feel free to message your host if you have any questions!
               </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chat Box */}
        <div className="md:col-span-2 flex flex-col h-[600px] md:h-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
               <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Chat with Your Host</h2>
              <p className="text-xs text-green-600 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                Typically replies within an hour
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 bg-[#F8FAFC]">
            <div className="space-y-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                     <MessageCircle className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No messages yet!</p>
                  <p className="text-sm text-gray-400 mt-1">Send a message to your host to get started.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isGuest = msg.direction === "inbound";
                  return (
                    <div key={msg.id} className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}>
                      {!isGuest && (
                        <div className="w-6 h-6 rounded-full bg-blue-100 shrink-0 mr-2 flex justify-center items-center text-[10px] font-bold text-blue-700 self-end mb-1">
                          H
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isGuest 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-white border text-gray-800 rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-[10px] mt-1.5 text-right ${isGuest ? 'text-blue-100' : 'text-gray-400'}`}>
                          {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t">
            {isPast ? (
              <p className="text-sm text-center text-gray-500 italic">This reservation has ended. Chat is closed.</p>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="rounded-full bg-gray-100 border-transparent focus-visible:ring-1 focus-visible:ring-blue-500"
                  disabled={sending}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending} 
                  className="rounded-full h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 shrink-0 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
