export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 cursor-pointer',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm cursor-pointer'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
