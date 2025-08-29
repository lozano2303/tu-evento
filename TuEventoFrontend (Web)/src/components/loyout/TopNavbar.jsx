export default function TopNavbar({ onExport, onImport }) {
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) onImport(file);
  };

  return (
    <div className="flex justify-between p-2 bg-gray-800 text-white">
      <button onClick={onExport} className="px-4 py-2 bg-blue-500 rounded">
        Exportar
      </button>
      <label className="px-4 py-2 bg-green-500 rounded cursor-pointer">
        Importar
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
      </label>
    </div>
  );
}
