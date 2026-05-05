import React from 'react';
import { Button } from '../ui/Button';

export const Topbar = ({ session, onSignOut }) => (
  <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-black text-sm">
        {session?.school?.name?.charAt(0) || session?.label?.charAt(0) || 'S'}
      </div>
      <div>
        <h1 className="font-black text-slate-900 dark:text-white text-base leading-tight">
          {session?.school?.name || 'SchoolOS'}
        </h1>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
          {session?.school?.role || session?.label || 'Super Admin'} Node
        </p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
      </button>
      <Button onClick={onSignOut} variant="secondary" className="text-[10px] px-4 py-2 uppercase tracking-widest font-black">
        Exit
      </Button>
    </div>
  </header>
);
