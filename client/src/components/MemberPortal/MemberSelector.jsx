import React from 'react';
import { Calendar, User, ChevronLeft, ChevronRight, Building2, Briefcase } from 'lucide-react';

export const MemberSelector = ({
  employeeUser,
  selectedDate,
  onDateChange
}) => {
  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        {/* Logged in Employee Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md border-2 border-white"
            style={{ backgroundColor: employeeUser?.avatarColor || '#0284c7' }}
          >
            {employeeUser?.name ? employeeUser.name.charAt(0) : 'U'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {employeeUser?.name || 'Team Member'}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {employeeUser?.role || 'Team Member'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {employeeUser?.department || 'Engineering'}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-600">{employeeUser?.email}</span>
            </div>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl hover:bg-white text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-sky-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl hover:bg-white text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              isToday
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};
