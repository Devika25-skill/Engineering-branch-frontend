import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Future Bridge Support", url: "/my-tickets", internal: true },
    {
      name: "Privacy Policy",
      url: "https://www.skilljourney.in/privacypolicy",
    },
    {
      name: "Terms & Conditions",
      url: "https://www.skilljourney.in/terms&conditions",
    },
    {
      name: "Cancellation & Refund",
      url: "https://www.skilljourney.in/cancellation&refund",
    },
    { name: "Shipping", url: "https://www.skilljourney.in/shipping" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=61564961467705",
      icon: Facebook,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/skilljourney.in/?utm_source=skilljourney.in",
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/skilljourney/",
      icon: Linkedin,
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/+919699185758",
      icon: MessageCircle,
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                FutureBridge
              </h3>
              <p className="text-xs text-gray-300 mt-1">by SkillJourney</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner in finding the perfect engineering college
              for your bright future.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.internal ? (
                    <Link
                      to={link.url}
                      className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail
                  size={16}
                  className="text-yellow-400 mt-1 flex-shrink-0"
                />
                <a
                  href="mailto:contactus@skilljourney.in"
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm"
                >
                  contactus@skilljourney.in
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MessageCircle
                  size={16}
                  className="text-yellow-400 mt-1 flex-shrink-0"
                />
                <a
                  href="https://wa.me/+919699185758"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm"
                >
                  +91 96991 85758
                </a>
              </div>
            </div>
          </div>

          {/* Office Addresses */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Our Offices</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin
                    size={14}
                    className="text-yellow-400 mt-1 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-medium text-yellow-400">
                      Corporate Office:
                    </p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      6th Floor, AWFIS Quantum Works, Karve Road, Nal Stop, Pune
                      411004
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                Follow Us
              </h4>
              <div className="flex justify-center sm:justify-start space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-yellow-400 hover:text-black p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                    aria-label={social.name}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} SkillJourney. All rights reserved. | FutureBridge -
            Your Engineering College Discovery Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
