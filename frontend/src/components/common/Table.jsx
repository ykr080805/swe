export default function Table({ headers, data, renderRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="text-xs uppercase bg-white text-gray-900 border-b border-gray-200">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-white/50 transition-colors">
                {renderRow(item)}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
