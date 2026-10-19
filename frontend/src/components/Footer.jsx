import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-outfit font-black text-2xl tracking-tight leading-none text-white">
                <span className="text-cyan-400">Guru</span>
                <span className="text-orange-400">Connect</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 font-medium">
              Hyperlocal Education Platform
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Quick Links
            </h4>
            <ul className="flex flex-col space-y-1.5 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/nearby" className="hover:text-cyan-400 transition-colors">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link to="/student?tab=guruai" className="hover:text-orange-400 transition-colors">
                  GuruAI
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Support
            </h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <Mail size={14} className="text-cyan-400" />
              <span>support@guruconnect.org.in</span>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} GuruConnect</p>
          <p className="font-semibold text-slate-400">
            Built with ❤️ by Md Danish Faizi Ansari
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
