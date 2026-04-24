import { Link } from 'react-router-dom';

const NAV_CARDS = [
  {
    to: '/hmc/leaves',
    label: 'L',
    title: 'Leave Applications',
    desc: 'Review and approve student hostel leaves',
    color: 'indigo',
  },
  {
    to: '/hmc/complaints',
    label: 'C',
    title: 'Complaints',
    desc: 'Manage and resolve hostel complaints',
    color: 'rose',
  },
  {
    to: '/hmc/nodues',
    label: 'N',
    title: 'No Dues',
    desc: 'Clear student dues for your department',
    color: 'emerald',
  },
  {
    to: '/hmc/transfers',
    label: 'T',
    title: 'Hostel Transfers',
    desc: 'Review room and hostel transfer requests',
    color: 'amber',
  },
  {
    to: '/hmc/assets',
    label: 'A',
    title: 'Assets',
    desc: 'Track hostel inventory and maintenance',
    color: 'blue',
  },
  {
    to: '/hmc/members',
    label: 'M',
    title: 'HMC Members',
    desc: 'Manage committee members (Warden only)',
    color: 'purple',
  },
];

const colorMap = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'hover:border-indigo-500'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'hover:border-rose-500'    },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-500' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'hover:border-amber-500'   },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'hover:border-blue-500'    },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'hover:border-purple-500'  },
};

export default function HMCDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2c3e50]">HMC Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Hostel Management Committee Administration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAV_CARDS.map(({ to, label, title, desc, color }) => {
          const c = colorMap[color];
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-gray-200 bg-white shadow-sm cursor-pointer transition-all duration-200 ${c.border} hover:shadow-md active:scale-95`}
            >
              <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center mb-4`}>
                <span className={`${c.text} text-xl font-bold`}>{label}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-xs text-gray-500">{desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
