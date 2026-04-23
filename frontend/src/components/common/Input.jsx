export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-500">{label}</label>}
      <input 
        className={`bg-white border ${error ? 'border-rose-500' : 'border-gray-200'} text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full p-2.5 outline-none transition-all`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
    </div>
  );
}
