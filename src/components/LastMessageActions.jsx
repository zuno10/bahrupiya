// src/components/LastMessageActions.jsx
import { useState } from "react";

export default function LastMessageActions({
  message,
  isLastUserMessage,
  isLastAssistantMessage,
  characterId,
  addMessage,
  getMessages,
  triggerSummaryIfNeeded,
  ws,
  children,
}) {
  const [isHover, setIsHover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.parts);

  // Edit last user message
  const handleEditSave = () => {
    const messages = getMessages(characterId);
    // Update last user message
    const updatedMessages = messages.map((m) =>
      m.id === message.id ? { ...m, parts: editText } : m
    );
    updatedMessages.forEach((m) => addMessage(characterId, m));

    // Remove dependent assistant messages
    updatedMessages
      .filter((m) => m.parentUserId === message.id)
      .forEach((m) => addMessage(characterId, { ...m, removed: true }));

    // Send updated message to backend
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(editText.trim());
    }

    triggerSummaryIfNeeded(updatedMessages);
    setIsEditing(false);
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    const messages = getMessages(characterId);
    const lastAssistant = messages
      .slice()
      .reverse()
      .find((m) => m.role === "assistant" && !m.removed);

    if (!lastAssistant) return;

    // Mark old assistant response as removed
    addMessage(characterId, { ...lastAssistant, removed: true });

    // Rebuild context (up to last user message)
    const context = messages.filter(
      (m) => !m.removed && (m.role === "user" || m.role === "assistant")
    );

    const lastUserMsg = context
      .slice()
      .reverse()
      .find((m) => m.role === "user");

    if (ws.current && ws.current.readyState === WebSocket.OPEN && lastUserMsg) {
      ws.current.send(lastUserMsg.parts.trim());
    }

    triggerSummaryIfNeeded(context);
  };

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="relative"
    >
      {children}

      {/* Edit button for last user message */}
      {isHover && isLastUserMessage && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute right-0 top-0 bg-gray-200 text-gray-800 p-1 rounded text-xs hover:bg-gray-300"
        >
          Edit
        </button>
      )}

      {/* Inline editing input */}
      {isEditing && (
        <div className="mt-1 flex space-x-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 p-1 border border-gray-300 rounded"
          />
          <button
            onClick={handleEditSave}
            className="bg-blue-500 text-white px-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-300 text-gray-800 px-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Regenerate button for last assistant message */}
      {isHover && isLastAssistantMessage && (
        <button
          onClick={handleRegenerate}
          className="absolute right-0 top-0 bg-gray-200 text-gray-800 p-1 rounded text-xs hover:bg-gray-300"
        >
          Regenerate
        </button>
      )}
    </div>
  );
}
