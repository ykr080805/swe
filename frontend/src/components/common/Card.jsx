export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white shadow-sm border border-gray-200 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}
