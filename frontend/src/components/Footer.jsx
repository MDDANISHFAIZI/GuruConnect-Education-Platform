import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Heart, Mail, Phone, Info } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-outfit font-extrabold text-2xl tracking-tight leading-none text-white">
                <span className="text-blue-400">Guru</span>
                <span className="text-orange-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              {t('hero.subtitle')}
            </p>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center space-x-2">
              <Info size={12} className="text-cyan-400" />
              <span>{t('hero.philosophyTitle')}</span>
            </div>
          </div>

          {/* Core Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">GuruConnect Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#how" className="hover:text-blue-400 transition-colors">{t('hero.howItWorks')}</a>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">🛡️ {t('placeholders.verificationLabel')}</span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">🤖 {t('placeholders.aiLabel')}</span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">🎥 {t('placeholders.onlineClassesLabel')}</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Contact & Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <Phone size={14} className="text-emerald-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={14} className="text-cyan-400" />
                <span>support@guruconnect.org.in</span>
              </li>
              <li className="text-xs text-slate-500 mt-2">
                🇮🇳 Made with passion to empower teachers across Tier-2, Tier-3 and rural India.
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} GuruConnect</p>
            <p className="text-[10px] text-slate-600">Founder, GuruConnect</p>
          </div>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Built with ❤️ by Md Danish Faizi Ansari</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
