import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pitch-craft-a20f2.firebaseapp.com",
  projectId: "pitch-craft-a20f2",
  storageBucket: "pitch-craft-a20f2.appspot.com",
  messagingSenderId: "912823133018",
  appId: "1:912823133018:web:0b46413e38559cd2014963",
  measurementId: "G-4EMWVMF2ZL",
};

// Initialize Firebase
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch {
  db = getFirestore();
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startupName: "",
    problem: "",
    solution: "",
  });
  const [pitches, setPitches] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState("");
  const [showPitchOutput, setShowPitchOutput] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [loadingPitches, setLoadingPitches] = useState(true);

  // Google Generative AI
  const getModel = () => {
    if (!import.meta.env.VITE_GOOGLE_AI_API_KEY) {
      throw new Error("Google AI API key not set");
    }
    const genAI = new GoogleGenerativeAI(
      import.meta.env.VITE_GOOGLE_AI_API_KEY,
    );
    return genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
    });
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        fetchPitchHistory(currentUser.uid);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch pitch history
  const fetchPitchHistory = (uid) => {
    const pitchesRef = collection(db, "users", uid, "pitches");
    const q = query(pitchesRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const pitchList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPitches(pitchList);
        setLoadingPitches(false);
      },
      (err) => {
        console.error("Error fetching pitches:", err);
        setLoadingPitches(false);
      },
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePitch = async (e) => {
    e.preventDefault();
    const { startupName, problem, solution } = formData;

    if (!startupName.trim() || !problem.trim() || !solution.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setGenerating(true);
    setGeneratedPitch("");
    setShowPitchOutput(false);

    try {
      const model = getModel();

      const systemPrompt = `You are PitchCraft, an expert startup pitch generator. 
      Generate a clear, concise, investor-ready startup pitch (200-300 words) with 
      bold title, sections: Problem ❗, Solution 💡, Market Opportunity 📈, Traction & Ask 🚀,
      include emojis and professional language.`;

      const userQuery = `Startup Name: ${startupName}\nProblem: ${problem}\nSolution: ${solution}`;

      const result = await model.generateContent(
        `${systemPrompt}\n\n${userQuery}`,
      );
      const pitch = result.response.text();

      setGeneratedPitch(pitch);
      setShowPitchOutput(true);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, "users", user.uid, "pitches"), {
          startupName,
          problem,
          solution,
          pitchText: pitch,
          createdAt: serverTimestamp(),
        });
      }

      setFormData({ startupName: "", problem: "", solution: "" });
    } catch (err) {
      console.error(err);
      setGeneratedPitch(`Error: ${err.message}`);
      setShowPitchOutput(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePitch = async (pitchId) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this pitch?")) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "pitches", pitchId));
      } catch (err) {
        console.error(err);
        alert("Error deleting pitch");
      }
    }
  };

  const handleViewPitch = (pitch) => {
    setSelectedPitch(pitch);
    setModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-indigo-600 font-bold text-xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-linear-to-br from-blue-50 to-slate-50 flex flex-col max-w-7xl">
      {/* Background blur */}
      {/* <div className="absolute -top-25 -right-25 w-96 h-96 bg-indigo-600 opacity-20 rounded-full filter blur-[120px] -z-10"></div> */}

      {/* NAVBAR */}
      <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-3xl font-extrabold cursor-pointer bg-clip-text text-transparent bg-linear-to-r from-indigo-500 via-blue-500 to-purple-700 drop-shadow-lg">
          PitchCraft{" "}
          <span className="bg-indigo-100 text-indigo-800 px-2 rounded-lg">
            AI
          </span>
        </h1>

        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-16 px-6 lg:px-20 text-white relative overflow-hidden bg-linear-to-b from-[#005ce6] via-[#00a4fc] to-[#12d9eb]">
        <h1 className="text-5xl lg:text-6xl font-extrabold mb-4">
          Transform Your Startup Idea
        </h1>
        <p className="text-lg lg:text-xl mb-8">
          Generate a powerful AI-crafted pitch in seconds and impress investors.
        </p>
        <button
          onClick={() =>
            document
              .getElementById("pitch-form")
              .scrollIntoView({ behavior: "smooth" })
          }
          className="px-6 py-3 bg-white text-sky-500 font-semibold rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
        >
          Generate Your Pitch
        </button>
      </section>

      {/* MAIN */}
      <main className="bg-linear-to-t from-white via-[#00a4fc] to-[#12d9eb] flex flex-col lg:flex-row justify-center gap-8 px-6 lg:px-20 py-12 mb-12">
        {/* Generator */}
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-xl p-8 border border-slate-100 relative">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6 border-b pb-4 text-center">
            🚀 Generate Your Startup Pitch
          </h2>

          <form
            id="pitch-form"
            className="space-y-5"
            onSubmit={handleGeneratePitch}
          >
            <div className="relative">
              <input
                type="text"
                name="startupName"
                value={formData.startupName}
                onChange={handleInputChange}
                placeholder="Startup Name"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="relative">
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleInputChange}
                placeholder="Describe the problem..."
                rows="3"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="relative">
              <textarea
                name="solution"
                value={formData.solution}
                onChange={handleInputChange}
                placeholder="Explain your solution..."
                rows="3"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 cursor-pointer bg-linear-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {generating ? "✨ Generating..." : "✨ Generate Pitch"}
            </button>
          </form>

          {generating && (
            <div className="mt-6 text-center text-indigo-600 font-medium animate-pulse">
              Generating your pitch...
            </div>
          )}

          {showPitchOutput && (
            <section className="mt-10 p-6 bg-linear-to-br from-green-50 to-white border border-green-200 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Your Generated Pitch
              </h3>
              <div className="bg-white border border-slate-200 p-5 rounded-lg text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {generatedPitch}
              </div>
            </section>
          )}
        </div>

        {/* Pitch History */}
        <div className="lg:w-1/3 bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6 border-b pb-4 text-center">
            📜 Pitch History
          </h2>
          {loadingPitches ? (
            <div className="text-center text-gray-500 py-8">
              Loading history...
            </div>
          ) : pitches.length === 0 ? (
            <p className="text-center text-gray-500 italic p-4">
              No pitches saved yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pitches.map((pitch) => (
                <div
                  key={pitch.id}
                  className="p-4 bg-slate-50 border border-gray-200 rounded-lg shadow hover:shadow-md cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-semibold text-gray-800">
                      {pitch.startupName || "Untitled"}
                    </h4>
                    <button
                      onClick={() => handleDeletePitch(pitch.id)}
                      className="cursor-pointer text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {pitch.pitchText?.substring(0, 80) + "..."}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400">
                      {pitch.createdAt
                        ? new Date(
                            pitch.createdAt.seconds * 1000,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <button
                      onClick={() => handleViewPitch(pitch)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer"
                    >
                      View Full →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && selectedPitch && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-indigo-600 mb-4">
              {selectedPitch.startupName}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-600 text-lg mb-2">
                  Problem:
                </h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {selectedPitch.problem}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 text-lg mb-2">
                  Solution:
                </h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {selectedPitch.solution}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-lg mb-2">
                  Generated Pitch:
                </h4>
                <div className="bg-linear-to-br from-sky-50 to-white p-4 rounded-lg border border-sky-100 whitespace-pre-wrap text-gray-800">
                  {selectedPitch.pitchText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
