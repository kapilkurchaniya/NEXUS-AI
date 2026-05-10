import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useChat } from '../chat/hooks/useChat';
import { useEffect } from 'react';

function Home() {
 const chat = useChat();
  const user = useSelector((state) => state.auth);
console.log(user);
useEffect(() => {
  chat.initailizeSocketConnection();
}, [chat]);

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome Home!</h1>
        <p className="text-lg text-gray-600">Login/Register successful. Auth working with CORS fixed.</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Logout or Test Again
        </Link>
      </div>
    </div>
  );
}

export default Home;

