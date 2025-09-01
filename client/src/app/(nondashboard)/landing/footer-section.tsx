import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const FooterSection = () => {
  return (
    <footer className="border-t border-gray-200 py-20">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link
            href="/"
            scroll={false}
            className="text-xl font-bold text-primary-700 mb-4"
          >
            RentAI
          </Link>
          <nav className="mb-4">
            <ul className="flex space-x-6">
              <li>
                <Link href="/about" scroll={false}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" scroll={false}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" scroll={false}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" scroll={false}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" scroll={false}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex space-x-4 mb-4">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faFacebook} className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faInstagram} className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary-600">
              <FontAwesomeIcon icon={faTwitter} className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="Linkedin"
              className="hover:text-primary-600"
            >
              <FontAwesomeIcon icon={faLinkedin} className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Youtube" className="hover:text-primary-600">
              <FontAwesomeIcon icon={faYoutube} className="h-6 w-6" />
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 flex justify-center space-x-4">
          <span>© RentAI. All rights reserved.</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
