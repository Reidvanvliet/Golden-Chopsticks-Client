import React, { useEffect, useState } from "react";
import { MapPin, Phone, Star } from "lucide-react";
import { googleAPI, handleAPIError } from "../services/api";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const ContactPage = ({ setCurrentPage, setLoading, setError }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);

  const handleGetDirections = () => {
    // Open Google Maps
    window.open("https://www.google.com/maps/place/Golden+Chopsticks+West+Kelowna/@49.829407,-119.631289,16z/data=!3m1!4b1!4m6!3m5!1s0x548275305412dde5:0x6106786b1effcf1a!8m2!3d49.829407!4d-119.6287141!16s%2Fg%2F1hc1ht9sw?entry=ttu&g_ep=EgoyMDI1MDcyNy4wIKXMDSoASAFQAw%3D%3D", "_blank");
  };

  const handleCallPhone = () => {
    window.location.href = "tel:+17787545538";
  };

  useEffect(() => {
    const getReviews = async () => {
      try {
        setLoading(true);
        const reviewsData = await googleAPI.getPlaceDetails(
          "ChIJ5d0SVDB1glQRGs__Hmt4BmE"
        );
        setReviews(reviewsData.result.reviews);
        setRating(reviewsData.result.rating);
        setTotalRatings(reviewsData.result.user_ratings_total);
      } catch (error) {
        handleAPIError(error, false);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Store Information */}
          <div className="space-y-8">
            {/* Store Info Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Store Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <MapPin className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-white font-medium">Location</p>
                    <p className="text-gray-300">
                      2459 Main St, Central Okanagan H, BC V4T 1K5
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <button
                      onClick={handleCallPhone}
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      (778) 754-5535
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentPage("menu")}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Order Now
                  </button>
                  
                  <button
                    onClick={handleGetDirections}
                    className="bg-red-700 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Opening Hours
              </h2>

              <div className="space-y-3">
                {[
                  { day: "Monday", hours: "Closed" },
                  { day: "Tuesday", hours: "3:00 PM - 8:30 PM" },
                  { day: "Wednesday", hours: "3:00 PM - 8:30 PM" },
                  { day: "Thursday", hours: "3:00 PM - 8:30 PM" },
                  { day: "Friday", hours: "3:00 PM - 8:30 PM" },
                  { day: "Saturday", hours: "3:00 PM - 8:30 PM" },
                  { day: "Sunday", hours: "3:00 PM - 8:30 PM" },
                ].map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex justify-between items-center"
                  >
                    <span className="text-white font-medium">
                      {schedule.day}
                    </span>
                    <span className="text-gray-300">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map and Reviews */}
          <div className="space-y-8">
            {/* Google Map Placeholder */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Find Us</h2>
              <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
                <div className="h-64 w-full">
                  <APIProvider
                    apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                  >
                    <Map
                      defaultZoom={13}
                      defaultCenter={{ lat: 49.829407, lng: -119.6287141 }}
                    >
                      <Marker
                        position={{ lat: 49.829407, lng: -119.6287141 }}
                      />
                    </Map>
                  </APIProvider>
                </div>
              </div>
            </div>

            {/* Google Reviews */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Customer Reviews
              </h2>

              {/* Overall Rating */}
              <div className="flex items-center mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-600"
                      } fill-current`}
                    />
                  ))}
                </div>
                <span className="ml-3 text-white font-semibold">
                  {rating ? `${rating.toFixed(1)} out of 5` : "Loading..."}
                </span>
                <span className="ml-2 text-gray-400">
                  ({totalRatings} reviews)
                </span>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-center mb-2">
                      <img
                        src={review.profile_photo_url}
                        alt={`${review.author_name} profile`}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-600"
                            } fill-current`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-300 text-sm">
                        {review.author_name}
                      </span>
                      <span className="ml-2 text-gray-500 text-xs">
                        • {review.relative_time_description}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <button
                onClick={() =>
                  window.open(
                    "https://www.google.com/search?sca_esv=d9deabf809eb67ed&rlz=1C1UEAD_enCA1087CA1087&sxsrf=AE3TifONo3L3Nq-QOOGHahfdx9ChTnDV_w:1753847391353&si=AMgyJEvkVjFQtirYNBhM3ZJIRTaSJ6PxY6y1_6WZHGInbzDnMYXRxeA6QS1QB0cNICEtgMAXLn860smHAYYDTDlROTXpyMsct1C_na7rUXU0mCBH2N7IUxhIP6MNO9Tt8h1kO0zO_KRSTW2e8fmuGWS8WYdpQnXI6Q%3D%3D&q=Golden+Chopsticks+West+Kelowna+Reviews&sa=X&ved=2ahUKEwjx34HW1uOOAxVJFTQIHSFaFMoQ0bkNegQIOxAE&biw=958&bih=918&dpr=1",
                    "_blank"
                  )
                }
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                View All Google Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
