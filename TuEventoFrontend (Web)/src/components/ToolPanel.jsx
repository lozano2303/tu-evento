export default function ToolPanel({ activeTool, setActiveTool }) {
  const tools = ["stage", "zone", "seatRow", "door", "exit"];

  return (
    <div className="flex gap-2 bg-gray-200 p-2">
      {tools.map((tool) => (
        <button
          key={tool}
          className={`px-4 py-2 rounded ${
            activeTool === tool ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setActiveTool(tool)}
        >
          {tool}
        </button>
      ))}
    </div>
  );
}
