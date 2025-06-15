import React from "react";
import { User, Phone, Calendar, MapPin, HeartPulse, Mail } from "lucide-react";

const PatientForm = () => {
  return (
    <div className="min-h-screen p-6 bg-cream-100 dark:bg-[#1e1e1e] transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white/30 dark:bg-[#2e2e2e]/40 backdrop-blur-md border border-white/20 dark:border-neutral-700 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-brown-800 dark:text-amber-200">
          Patient Registration
        </h2>

        <form className="space-y-6">
          {/* Full Name (required) */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-brown-500 dark:text-amber-300" />
              <input
                type="text"
                required
                placeholder="John Doe"
                className="w-full pl-10 py-3 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-brown-500 dark:text-amber-300" />
              <input
                type="tel"
                placeholder="+1234567890"
                className="w-full pl-10 py-3 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Age</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 text-brown-500 dark:text-amber-300" />
              <input
                type="number"
                placeholder="30"
                className="w-full pl-10 py-3 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-brown-500 dark:text-amber-300" />
              <input
                type="text"
                placeholder="123 Main Street"
                className="w-full pl-10 py-3 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Medical Aid Name */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Medical Aid Name</label>
            <div className="relative">
              <HeartPulse className="absolute left-3 top-3.5 text-brown-500 dark:text-amber-300" />
              <input
                type="text"
                placeholder="MediCare"
                className="w-full pl-10 py-3 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Medical Aid Number */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Medical Aid Number</label>
            <input
              type="text"
              placeholder="MED-12345678"
              className="w-full py-3 px-4 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Emergency Contact Number</label>
            <input
              type="tel"
              placeholder="+0987654321"
              className="w-full py-3 px-4 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Allergies</label>
            <input
              type="text"
              placeholder="e.g., Penicillin"
              className="w-full py-3 px-4 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Comorbidities */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Comorbidities</label>
            <input
              type="text"
              placeholder="e.g., Diabetes, Hypertension"
              className="w-full py-3 px-4 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Gender</label>
            <div className="flex gap-6 text-brown-800 dark:text-amber-200">
              {["Male", "Female", "Other"].map((gender) => (
                <label key={gender} className="flex items-center gap-2">
                  <input type="radio" name="gender" value={gender} className="accent-amber-600" />
                  {gender}
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-brown-800 dark:text-amber-100">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-brown-500 dark:text-amber-300" />
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full pl-10 py-3 rounded-xl bg-white/40 dark:bg-neutral-800/50 border border-brown-200 dark:border-amber-600 text-brown-800 dark:text-amber-100 focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brown-700 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;