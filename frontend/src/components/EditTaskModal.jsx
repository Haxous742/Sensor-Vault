import React, { useState } from "react";

const EditTaskModal = ({ taskNumber, team, onClose }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || !team) return;
    setLoading(true);
    try {
      await fetch(`/api/task${taskNumber}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ team, text: input }),
      });
      onClose();
    } catch (error) {
      console.error(`Failed to edit task${taskNumber}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // fully black background (opaque)
    <>
      <style>{`
        input.edit-task-input,
        input.edit-task-input[type="text"],
        .edit-task-input {
          color: #000000 !important;
        }
        input.edit-task-input::placeholder,
        .edit-task-input::placeholder {
          color: #9ca3af !important;
        }
      `}</style>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-80 relative">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Editt Task {taskNumber}
          </h2>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter new correct answer..."
            className="edit-task-input w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-400"
            style={{ color: '#000000' }}
          />

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 rounded-lg text-white ${
              loading || !input.trim()
                ? "bg-blue-300"
                : "bg-blue-500 hover:bg-blue-600"
            } transition`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default EditTaskModal;
