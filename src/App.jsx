import { useEffect } from 'react';
import Chat from './Chat';
import { useCharacterStore } from './store/characterStore';

function App() {
  const { fetchCharacters, characters, loading, error, selectedCharacter, selectCharacter } = useCharacterStore();

  useEffect(() => {
    fetchCharacters();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading characters...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  // If no character is selected, show selection screen
  if (!selectedCharacter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
  <h1 className="text-3xl font-bold mb-8">Select a Character</h1>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
    {characters.map((c) => (
      <button
        key={c.id}
        onClick={() => selectCharacter(c)}
        className="bg-white border border-gray-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl p-5 text-left group"
      >
        <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 mb-2">
          {c.name}
        </h2>
        <div className="text-gray-600 text-sm leading-relaxed mb-4">
          {c.description}
        </div>

        <div className="flex flex-wrap">
          {c.tags && c.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2 mb-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </button>
    ))}
  </div>
</div>

    );
  }

  // Show Chat when a character is selected
  return <Chat />;
}

export default App;
